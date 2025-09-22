import { dbOperations } from '../db/database';

// Service layer that implements write-through caching
// MSW handlers will use this service for all operations

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCacheKey(type, id, params = {}) {
    const paramsStr = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${type}:${id || 'list'}:${paramsStr}`;
  }

  setCache(key, data, ttl = this.cacheTimeout) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Jobs service methods
  async getJobs(page = 1, pageSize = 10, filters = {}) {
    const cacheKey = this.getCacheKey('jobs', null, { page, pageSize, ...filters });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 Returning cached jobs data');
      return cached;
    }

    try {
      const data = await dbOperations.getJobs(page, pageSize, filters);
      this.setCache(cacheKey, data);
      console.log('💾 Cached jobs data from IndexedDB');
      return data;
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      throw error;
    }
  }

 async getJob(id) {
  const jobId = parseInt(id); // ✅ Ensure it's always a number
  console.log('🔵 dataService.getJob called with ID:', id, '→', jobId);
  
  if (isNaN(jobId)) {
    throw new Error('Invalid job ID');
  }
  
  const cacheKey = this.getCacheKey('job', jobId);
  const cached = this.getCache(cacheKey);
  
  if (cached) {
    console.log(`📦 Returning cached job ${jobId}:`, cached.title);
    return cached;
  }

  try {
    console.log('🔵 Cache miss, calling dbOperations.getJob...');
    const data = await dbOperations.getJob(jobId);
    console.log('🔵 dbOperations.getJob returned:', data ? `Found: ${data.title}` : 'Not found');
    
    if (data) {
      this.setCache(cacheKey, data);
      console.log(`💾 Cached job ${jobId}: ${data.title}`);
    }
    return data;
  } catch (error) {
    console.error(`❌ Error fetching job ${jobId}:`, error);
    throw error;
  }
}


  async createJob(jobData) {
    try {
      const newJob = await dbOperations.createJob(jobData);
      this.clearCache('jobs'); // Clear jobs list cache
      this.setCache(this.getCacheKey('job', newJob.id), newJob);
      console.log('✅ Created job and cleared cache');
      return newJob;
    } catch (error) {
      console.error('❌ Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id, updates) {
    try {
      const updatedJob = await dbOperations.updateJob(id, updates);
      this.clearCache('jobs'); // Clear jobs list cache
      this.setCache(this.getCacheKey('job', id), updatedJob);
      console.log(`✅ Updated job ${id} and cleared cache`);
      return updatedJob;
    } catch (error) {
      console.error(`❌ Error updating job ${id}:`, error);
      throw error;
    }
  }

  async reorderJobs(reorderedJobs) {
    try {
      await dbOperations.reorderJobs(reorderedJobs);
      this.clearCache('jobs'); // Clear all jobs cache
      console.log('✅ Reordered jobs and cleared cache');
      return reorderedJobs;
    } catch (error) {
      console.error('❌ Error reordering jobs:', error);
      throw error;
    }
  }

  // Candidates service methods
  async getCandidates(page = 1, pageSize = 50, filters = {}) {
    const cacheKey = this.getCacheKey('candidates', null, { page, pageSize, ...filters });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 Returning cached candidates data');
      return cached;
    }

    try {
      const data = await dbOperations.getCandidates(page, pageSize, filters);
      this.setCache(cacheKey, data);
      console.log('💾 Cached candidates data from IndexedDB');
      return data;
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      throw error;
    }
  }

  async getAllCandidates() {
    const cacheKey = this.getCacheKey('all_candidates', null);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 Returning cached all candidates');
      return cached;
    }

    try {
      const data = await dbOperations.getAllCandidates();
      this.setCache(cacheKey, data, 2 * 60 * 1000); // Shorter cache for all candidates
      console.log('💾 Cached all candidates from IndexedDB');
      return data;
    } catch (error) {
      console.error('❌ Error fetching all candidates:', error);
      throw error;
    }
  }

  async getCandidate(id) {
    const cacheKey = this.getCacheKey('candidate', id);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log(`📦 Returning cached candidate ${id}`);
      return cached;
    }

    try {
      const data = await dbOperations.getCandidate(id);
      if (data) {
        this.setCache(cacheKey, data);
        console.log(`💾 Cached candidate ${id} from IndexedDB`);
      }
      return data;
    } catch (error) {
      console.error(`❌ Error fetching candidate ${id}:`, error);
      throw error;
    }
  }

  async updateCandidate(id, updates) {
    try {
      const updatedCandidate = await dbOperations.updateCandidate(id, updates);
      
      // Clear related caches
      this.clearCache('candidates');
      this.clearCache('all_candidates');
      this.setCache(this.getCacheKey('candidate', id), updatedCandidate);
      
      console.log(`✅ Updated candidate ${id} and cleared cache`);
      return updatedCandidate;
    } catch (error) {
      console.error(`❌ Error updating candidate ${id}:`, error);
      throw error;
    }
  }

  async addCandidateNote(candidateId, noteData) {
    try {
      const newNote = await dbOperations.addCandidateNote(candidateId, noteData);
      
      // Clear candidate cache to fetch updated data
      this.cache.delete(this.getCacheKey('candidate', candidateId));
      
      console.log(`✅ Added note to candidate ${candidateId}`);
      return newNote;
    } catch (error) {
      console.error(`❌ Error adding note to candidate ${candidateId}:`, error);
      throw error;
    }
  }

  // Assessments service methods
  async getAssessments(filters = {}) {
    const cacheKey = this.getCacheKey('assessments', null, filters);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 Returning cached assessments');
      return cached;
    }

    try {
      const data = await dbOperations.getAssessments(filters);
      this.setCache(cacheKey, data);
      console.log('💾 Cached assessments from IndexedDB');
      return data;
    } catch (error) {
      console.error('❌ Error fetching assessments:', error);
      throw error;
    }
  }

  async getAssessment(id) {
    const cacheKey = this.getCacheKey('assessment', id);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log(`📦 Returning cached assessment ${id}`);
      return cached;
    }

    try {
      const data = await dbOperations.getAssessment(id);
      if (data) {
        this.setCache(cacheKey, data);
        console.log(`💾 Cached assessment ${id} from IndexedDB`);
      }
      return data;
    } catch (error) {
      console.error(`❌ Error fetching assessment ${id}:`, error);
      throw error;
    }
  }

  async createAssessment(assessmentData) {
    try {
      const newAssessment = await dbOperations.createAssessment(assessmentData);
      this.clearCache('assessments');
      this.setCache(this.getCacheKey('assessment', newAssessment.id), newAssessment);
      console.log('✅ Created assessment and cleared cache');
      return newAssessment;
    } catch (error) {
      console.error('❌ Error creating assessment:', error);
      throw error;
    }
  }

  async updateAssessment(id, updates) {
    try {
      const updatedAssessment = await dbOperations.updateAssessment(id, updates);
      this.clearCache('assessments');
      this.setCache(this.getCacheKey('assessment', id), updatedAssessment);
      console.log(`✅ Updated assessment ${id} and cleared cache`);
      return updatedAssessment;
    } catch (error) {
      console.error(`❌ Error updating assessment ${id}:`, error);
      throw error;
    }
  }

  // Submissions service methods
  async submitAssessment(submissionData) {
    try {
      const submission = await dbOperations.submitAssessment(submissionData);
      console.log('✅ Assessment submitted');
      return submission;
    } catch (error) {
      console.error('❌ Error submitting assessment:', error);
      throw error;
    }
  }

  async getSubmissions(assessmentId) {
    const cacheKey = this.getCacheKey('submissions', assessmentId);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log(`📦 Returning cached submissions for assessment ${assessmentId}`);
      return cached;
    }

    try {
      const data = await dbOperations.getSubmissions(assessmentId);
      this.setCache(cacheKey, data, 60 * 1000); // 1 minute cache for submissions
      console.log(`💾 Cached submissions for assessment ${assessmentId}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching submissions for assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  // App state management
  async saveAppState(key, value) {
    try {
      await dbOperations.saveAppState(key, value);
      console.log(`✅ Saved app state: ${key}`);
    } catch (error) {
      console.error(`❌ Error saving app state ${key}:`, error);
      throw error;
    }
  }

  async getAppState(key) {
    try {
      const data = await dbOperations.getAppState(key);
      console.log(`📦 Retrieved app state: ${key}`);
      return data;
    } catch (error) {
      console.error(`❌ Error retrieving app state ${key}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
