import { http, HttpResponse, delay } from 'msw';
import { 
  getJobsData, 
  getCandidatesData, 
  getAssessmentsData, 
  updateJobsData, 
  updateCandidatesData,
  updateAssessmentsData
} from './mockData';

// Simulate network delay with more realistic variance
const networkDelay = () => delay(Math.random() * 1000 + 200); // 200-1200ms as required

export const handlers = [
  // Jobs endpoints
  // GET /jobs?search=&status=&page=&pageSize=&sort=
  http.get('/api/jobs', async ({ request }) => {
    await networkDelay();
    
    // 5% error rate
    if (Math.random() < 0.05) {
      console.log('❌ Simulated jobs GET error');
      return new HttpResponse(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = [...getJobsData()];

    // Apply filters
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    // Apply sorting
    jobs.sort((a, b) => {
      if (sort === 'order') return a.order - b.order;
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    // Apply pagination
    const start = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(start, start + pageSize);

    console.log(`✅ Jobs GET: page ${page}, ${paginatedJobs.length}/${jobs.length} results`);
    return HttpResponse.json({
      data: paginatedJobs,
      total: jobs.length,
      page,
      pageSize,
      totalPages: Math.ceil(jobs.length / pageSize)
    });
  }),

  // POST /jobs → { id, title, slug, status: "active"|"archived", tags: string[], order: number }
  http.post('/api/jobs', async ({ request }) => {
    await networkDelay();

    if (Math.random() < 0.1) {
      console.log('❌ Simulated job POST error');
      return new HttpResponse(
        JSON.stringify({ error: 'Failed to create job' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jobData = await request.json();
    const jobs = getJobsData();
    
    // Generate unique slug
    let baseSlug = jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug uniqueness
    while (jobs.some(job => job.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newJob = {
      ...jobData,
      id: Math.max(...jobs.map(j => j.id), 0) + 1,
      slug,
      status: jobData.status || 'active',
      order: jobData.order !== undefined ? jobData.order : jobs.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateJobsData([...jobs, newJob]);
    console.log(`✅ Created job: ${newJob.title} (slug: ${newJob.slug})`);
    return HttpResponse.json(newJob, { status: 201 });
  }),


  // PATCH /jobs/:id
  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await networkDelay();

    // 5% error rate for write operations
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated job PATCH error for job ${params.id}`);
      return new HttpResponse(
        JSON.stringify({ error: 'Failed to update job' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jobId = parseInt(params.id);
    const updates = await request.json();
    const jobs = getJobsData();
    
    const jobIndex = jobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) {
      return new HttpResponse(
        JSON.stringify({ error: 'Job not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
    );

    updateJobsData(updatedJobs);
    const updatedJob = updatedJobs.find(job => job.id === jobId);
    console.log(`✅ Updated job ${jobId}: ${updatedJob?.title}`);
    return HttpResponse.json(updatedJob);
  }),

  // PATCH /jobs/:id/reorder → { fromOrder, toOrder } (occasionally return 500 to test rollback)
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await networkDelay();

    // 10% failure rate for rollback testing
    if (Math.random() < 0.1) {
      console.log(`❌ Simulated reorder failure for job ${params.id}`);
      return new HttpResponse(
        JSON.stringify({ error: 'Reorder failed - testing rollback mechanism' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jobId = parseInt(params.id);
    const { fromOrder, toOrder } = await request.json();
    const jobs = [...getJobsData()];
    
    // Find the job to move
    const jobToMove = jobs.find(job => job.id === jobId);
    if (!jobToMove) {
      return new HttpResponse(
        JSON.stringify({ error: 'Job not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove job from current position
    const filteredJobs = jobs.filter(job => job.id !== jobId);
    
    // Insert job at new position
    filteredJobs.splice(toOrder, 0, { ...jobToMove, order: toOrder });
    
    // Update order values for all jobs
    filteredJobs.forEach((job, index) => {
      job.order = index;
      job.updatedAt = new Date().toISOString();
    });

    updateJobsData(filteredJobs);
    console.log(`✅ Reordered job ${jobId} from order ${fromOrder} to ${toOrder}`);
    return HttpResponse.json({ success: true, newOrder: toOrder });
  }),

  // Candidates endpoints
  // GET /candidates?search=&stage=&page=
  // 🚀 COMPLETE CANDIDATES HANDLERS

// GET /candidates - List with search and filtering
http.get('/api/candidates', async ({ request }) => {
  await networkDelay();

  // 5% error rate
  if (Math.random() < 0.05) {
    console.log('❌ Simulated candidates GET error');
    return new HttpResponse(
      JSON.stringify({ error: 'Failed to fetch candidates' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const stage = url.searchParams.get('stage') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
  const jobId = url.searchParams.get('jobId') || '';

  let candidates = [...getCandidatesData()];

  // Apply filters
  if (search) {
    candidates = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (stage && stage !== 'all') {
    candidates = candidates.filter(candidate => candidate.stage === stage);
  }

  if (jobId && jobId !== 'all') {
    candidates = candidates.filter(candidate => candidate.jobId === parseInt(jobId));
  }

  // Sort by most recent
  candidates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Apply pagination
  const start = (page - 1) * pageSize;
  const paginatedCandidates = candidates.slice(start, start + pageSize);

  console.log(`✅ Candidates GET: page ${page}, ${paginatedCandidates.length}/${candidates.length} results (Total DB: ${getCandidatesData().length})`);
  
  return HttpResponse.json({
    data: paginatedCandidates,
    total: candidates.length,
    page,
    pageSize,
    totalPages: Math.ceil(candidates.length / pageSize)
  });
}),

// 🚀 NEW: GET /candidates/:id - Single candidate profile
http.get('/api/candidates/:id', async ({ params }) => {
  await networkDelay();

  // 5% error rate
  if (Math.random() < 0.05) {
    console.log(`❌ Simulated candidate GET error for candidate ${params.id}`);
    return new HttpResponse(
      JSON.stringify({ error: 'Failed to fetch candidate' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const candidateId = parseInt(params.id);
  const candidates = getCandidatesData();
  const candidate = candidates.find(c => c.id === candidateId);

  if (!candidate) {
    return new HttpResponse(
      JSON.stringify({ error: 'Candidate not found' }), 
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log(`✅ Candidate GET: ${candidate.name} (ID: ${candidateId})`);
  return HttpResponse.json(candidate);
}),

// POST /candidates → Create new candidate
http.post('/api/candidates', async ({ request }) => {
  await networkDelay();

  if (Math.random() < 0.05) {
    console.log('❌ Simulated candidate POST error');
    return new HttpResponse(
      JSON.stringify({ error: 'Failed to create candidate' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const candidateData = await request.json();
  const candidates = getCandidatesData();
  
  const newCandidate = {
    ...candidateData,
    id: Math.max(...candidates.map(c => c.id), 0) + 1,
    stage: candidateData.stage || 'applied',
    appliedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    timeline: [
      {
        id: 1,
        stage: 'applied',
        timestamp: new Date().toISOString(),
        note: 'Application received',
        user: 'System'
      }
    ]
  };

  updateCandidatesData([...candidates, newCandidate]);
  console.log(`✅ Created candidate: ${newCandidate.name} (${newCandidate.stage})`);
  return HttpResponse.json(newCandidate, { status: 201 });
}),

// PATCH /candidates/:id - Update candidate (stage transitions)
http.patch('/api/candidates/:id', async ({ params, request }) => {
  await networkDelay();

  // 5% error rate for write operations
  if (Math.random() < 0.05) {
    console.log(`❌ Simulated candidate PATCH error for candidate ${params.id}`);
    return new HttpResponse(
      JSON.stringify({ error: 'Failed to update candidate' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const candidateId = parseInt(params.id);
  const updates = await request.json();
  const candidates = getCandidatesData();
  
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  if (candidateIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ error: 'Candidate not found' }), 
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const candidate = candidates[candidateIndex];
  const oldStage = candidate.stage;
  
  // Update candidate
  const updatedCandidate = {
    ...candidate,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Add timeline entry if stage changed
  if (updates.stage && updates.stage !== oldStage) {
    updatedCandidate.timeline = [
      ...candidate.timeline,
      {
        id: candidate.timeline.length + 1,
        stage: updates.stage,
        timestamp: new Date().toISOString(),
        note: `Moved from ${oldStage} to ${updates.stage}`,
        user: 'HR User'
      }
    ];
  }

  const updatedCandidates = candidates.map(c => 
    c.id === candidateId ? updatedCandidate : c
  );

  updateCandidatesData(updatedCandidates);
  console.log(`✅ Updated candidate ${candidateId}: ${candidate.name} (${oldStage} → ${updatedCandidate.stage})`);
  return HttpResponse.json(updatedCandidate);
}),

// GET /candidates/:id/timeline - Get candidate timeline
http.get('/api/candidates/:id/timeline', async ({ params }) => {
  await networkDelay();

  const candidateId = parseInt(params.id);
  const candidates = getCandidatesData();
  const candidate = candidates.find(c => c.id === candidateId);

  if (!candidate) {
    return new HttpResponse(
      JSON.stringify({ error: 'Candidate not found' }), 
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Return the timeline from candidate data (enhanced by our new mock data)
  const timeline = candidate.timeline || [];

  console.log(`✅ Timeline GET for candidate ${candidateId}: ${timeline.length} events`);
  return HttpResponse.json(timeline);
}),


  // Assessment endpoints
  // GET /assessments/:jobId
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await networkDelay();

    const jobId = parseInt(params.jobId);
    const assessments = getAssessmentsData();
    const assessment = assessments.find(a => a.jobId === jobId);

    if (!assessment) {
      console.log(`❌ Assessment not found for job ${jobId}`);
      return new HttpResponse(
        JSON.stringify({ error: 'Assessment not found for this job' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Fetched assessment for job ${jobId}: ${assessment.title}`);
    return HttpResponse.json(assessment);
  }),

  // PUT /assessments/:jobId
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await networkDelay();

    // 5% failure rate
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated assessment PUT error for job ${params.jobId}`);
      return new HttpResponse(
        JSON.stringify({ error: 'Failed to save assessment' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jobId = parseInt(params.jobId);
    const assessmentData = await request.json();
    const assessments = getAssessmentsData();
    
    const existingIndex = assessments.findIndex(a => a.jobId === jobId);
    
    if (existingIndex >= 0) {
      // Update existing assessment
      assessments[existingIndex] = { 
        ...assessments[existingIndex], 
        ...assessmentData,
        jobId,
        updatedAt: new Date().toISOString()
      };
      console.log(`✅ Updated assessment for job ${jobId}: ${assessments[existingIndex].title}`);
      updateAssessmentsData(assessments);
      return HttpResponse.json(assessments[existingIndex]);
    } else {
      // Create new assessment
      const newAssessment = {
        id: `assess-${Date.now()}`,
        jobId,
        ...assessmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      assessments.push(newAssessment);
      console.log(`✅ Created new assessment for job ${jobId}: ${newAssessment.title}`);
      updateAssessmentsData(assessments);
      return HttpResponse.json(newAssessment, { status: 201 });
    }
  }),

  // POST /assessments/:jobId/submit (store response locally)
  // POST /assessments/:jobId/submit (store response locally)
http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
  console.log('🎯 SUBMIT HANDLER CALLED!'); // Add this line
  console.log('🎯 Params:', params); // Add this line
  console.log('🎯 JobId from params:', params.jobId); // Add this line
  
  await networkDelay();

  // 5% error rate
  if (Math.random() < 0.05) {
    console.log(`❌ Simulated assessment submission error for job ${params.jobId}`);
    return new HttpResponse(
      JSON.stringify({ error: 'Failed to submit assessment' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const jobId = parseInt(params.jobId);
  const submissionData = await request.json();

  console.log('📝 Received submission data:', submissionData); // Add this line

  // Calculate basic scoring
  const answers = submissionData.answers || {};
  const totalQuestions = Object.keys(answers).length;
  const answeredQuestions = Object.values(answers).filter(answer => {
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.toString().trim() !== '';
  }).length;
  
  const score = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Store submission locally in localStorage
  const submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    jobId,
    assessmentId: submissionData.assessmentId,
    answers: answers,
    candidateInfo: submissionData.candidateInfo || {},
    submittedAt: new Date().toISOString(),
    timeSpent: submissionData.timeSpent || 0,
    score,
    completionPercentage: Math.round((answeredQuestions / totalQuestions) * 100)
  };

  // Get existing submissions from localStorage
  const existingSubmissions = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
  existingSubmissions.push(submission);
  localStorage.setItem('assessmentSubmissions', JSON.stringify(existingSubmissions));

  console.log(`✅ Assessment submission stored for job ${jobId}: score ${score}%`, submission.id);

  return HttpResponse.json({ 
    success: true,
    submissionId: submission.id,
    submittedAt: submission.submittedAt,
    score: submission.score,
    completionPercentage: submission.completionPercentage,
    message: 'Assessment submitted successfully'
  });
}),

];
