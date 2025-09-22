import Dexie from 'dexie';

export class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: '++id, title, slug, status, department, location, type, experience, salary, skills, description, requirements, benefits, createdAt, archivedAt, order',
      candidates: '++id, name, email, phone, stage, experience, salary, location, skills, resume, linkedin, github, appliedDate, jobId, notes, timeline',
      assessments: '++id, title, description, jobId, questions, settings, createdAt, isActive',
      submissions: '++id, assessmentId, candidateId, answers, score, completedAt, timeSpent',
      appState: 'key, value, updatedAt'
    });

    // Hooks for automatic timestamps
    this.jobs.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = obj.createdAt || new Date().toISOString();
    });

    this.candidates.hook('creating', (primKey, obj, trans) => {
      obj.appliedDate = obj.appliedDate || new Date().toISOString();
      obj.notes = obj.notes || [];
      obj.timeline = obj.timeline || [];
    });

    this.assessments.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = obj.createdAt || new Date().toISOString();
      obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
    });

    this.submissions.hook('creating', (primKey, obj, trans) => {
      obj.completedAt = obj.completedAt || new Date().toISOString();
    });
  }
}

// Export singleton instance
export const db = new TalentFlowDB();

// Initialize database with seed data if empty
export const initializeDatabase = async () => {
  try {
    console.log('🔍 Initializing TalentFlow database...');
    
    // Check if data already exists
    const jobsCount = await db.jobs.count();
    const candidatesCount = await db.candidates.count();
    
    if (jobsCount === 0 || candidatesCount === 0) {
      console.log('🌱 Database is empty, seeding with initial data...');
      await seedDatabase();
    } else {
      console.log('✅ Database already contains data:', { jobs: jobsCount, candidates: candidatesCount });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
};

// Seed database with initial data
const seedDatabase = async () => {
  const { generateJobs, generateCandidates, generateAssessments } = await import('./seedData');
  
  try {
    await db.transaction('rw', db.jobs, db.candidates, db.assessments, async () => {
      // Seed jobs
      const jobs = generateJobs();
      await db.jobs.bulkAdd(jobs);
      console.log(`✅ Seeded ${jobs.length} jobs`);
      
      // Seed candidates
      const candidates = generateCandidates();
      await db.candidates.bulkAdd(candidates);
      console.log(`✅ Seeded ${candidates.length} candidates`);
      
      // Seed assessments
      const assessments = generateAssessments();
      await db.assessments.bulkAdd(assessments);
      console.log(`✅ Seeded ${assessments.length} assessments`);
    });
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
};

// Database operations
export const dbOperations = {
  // Jobs
  async getJobs(page = 1, pageSize = 10, filters = {}) {
    let query = db.jobs.orderBy('order');
    
    if (filters.status && filters.status !== 'all') {
      query = query.filter(job => job.status === filters.status);
    }
    
    if (filters.department && filters.department !== 'all') {
      query = query.filter(job => job.department === filters.department);
    }
    
    if (filters.search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    const total = await query.count();
    const jobs = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();
    
    return {
      data: jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  },
// In db/database.js
// In db/database.js
async getJob(id) {
  const jobId = parseInt(id);
  console.log('🟢 dbOperations.getJob called with ID:', id, '→', jobId);
  
  if (isNaN(jobId)) {
    console.log('🟢 Invalid ID provided');
    return null;
  }
  
  try {
    const job = await db.jobs.get(jobId);
    console.log('🟢 Database returned:', job ? `Job found: ${job.title} (ID: ${job.id})` : 'No job found');
    return job;
  } catch (error) {
    console.error('🟢 Database error getting job:', error);
    throw error;
  }
},


  async createJob(jobData) {
    const maxOrder = await db.jobs.orderBy('order').last();
    const newJob = {
      ...jobData,
      order: (maxOrder?.order || 0) + 1,
      createdAt: new Date().toISOString()
    };
    const id = await db.jobs.add(newJob);
    return await db.jobs.get(id);
  },

  async updateJob(id, updates) {
    await db.jobs.update(parseInt(id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return await db.jobs.get(parseInt(id));
  },

  async reorderJobs(reorderedJobs) {
    await db.transaction('rw', db.jobs, async () => {
      for (const job of reorderedJobs) {
        await db.jobs.update(job.id, { order: job.order });
      }
    });
  },

  // Candidates
  async getCandidates(page = 1, pageSize = 50, filters = {}) {
    let query = db.candidates.orderBy('appliedDate').reverse();
    
    if (filters.stage && filters.stage !== 'all') {
      query = query.filter(candidate => candidate.stage === filters.stage);
    }
    
    if (filters.jobId && filters.jobId !== 'all') {
      query = query.filter(candidate => candidate.jobId === parseInt(filters.jobId));
    }
    
    if (filters.search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    const total = await query.count();
    const candidates = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();
    
    return {
      data: candidates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  },

  async getAllCandidates() {
    return await db.candidates.toArray();
  },

  async getCandidate(id) {
    return await db.candidates.get(parseInt(id));
  },

  async updateCandidate(id, updates) {
    const candidate = await db.candidates.get(parseInt(id));
    if (!candidate) throw new Error('Candidate not found');
    
    // Add timeline entry for stage changes
    if (updates.stage && updates.stage !== candidate.stage) {
      const timelineEntry = {
        id: Date.now(),
        stage: updates.stage,
        note: `Stage changed from ${candidate.stage} to ${updates.stage}`,
        timestamp: new Date().toISOString(),
        user: 'Current User',
        type: 'stage_change'
      };
      
      updates.timeline = [...(candidate.timeline || []), timelineEntry];
    }
    
    await db.candidates.update(parseInt(id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return await db.candidates.get(parseInt(id));
  },

  async addCandidateNote(candidateId, noteData) {
    const candidate = await db.candidates.get(parseInt(candidateId));
    if (!candidate) throw new Error('Candidate not found');
    
    const newNote = {
      ...noteData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    const updatedNotes = [...(candidate.notes || []), newNote];
    await db.candidates.update(parseInt(candidateId), { notes: updatedNotes });
    
    return newNote;
  },

  // Assessments
  async getAssessments(filters = {}) {
    let query = db.assessments.orderBy('createdAt').reverse();
    
    if (filters.jobId && filters.jobId !== 'all') {
      query = query.filter(assessment => assessment.jobId === parseInt(filters.jobId));
    }
    
    return await query.toArray();
  },

  async getAssessment(id) {
    return await db.assessments.get(parseInt(id));
  },

  async createAssessment(assessmentData) {
    const id = await db.assessments.add(assessmentData);
    return await db.assessments.get(id);
  },

  async updateAssessment(id, updates) {
    await db.assessments.update(parseInt(id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return await db.assessments.get(parseInt(id));
  },

  // Submissions
  async submitAssessment(submissionData) {
    const id = await db.submissions.add(submissionData);
    return await db.submissions.get(id);
  },

  async getSubmissions(assessmentId) {
    return await db.submissions.where('assessmentId').equals(parseInt(assessmentId)).toArray();
  },

  // App State
  async saveAppState(key, value) {
    await db.appState.put({
      key,
      value: JSON.stringify(value),
      updatedAt: new Date().toISOString()
    });
  },

  async getAppState(key) {
    const state = await db.appState.get(key);
    return state ? JSON.parse(state.value) : null;
  }
};
