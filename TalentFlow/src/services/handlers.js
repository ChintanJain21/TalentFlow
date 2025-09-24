import { http, HttpResponse, delay } from 'msw';
import { dataService } from './dataService';

// Simulate realistic network delay
const networkDelay = () => delay(Math.random() * 800 + 200); // 200-1000ms

export const handlers = [
  // 🏢 JOBS ENDPOINTS
  http.get('/api/jobs', async ({ request }) => {
    await networkDelay();
    
    // 5% error rate for realistic testing
    if (Math.random() < 0.05) {
      console.log('❌ Simulated jobs GET error');
      return HttpResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const department = url.searchParams.get('department') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    try {
      const data = await dataService.getJobs(page, pageSize, { 
        search, 
        status: status === 'all' ? '' : status,
        department: department === 'all' ? '' : department
      });
      
      console.log(`✅ MSW: Jobs GET - page ${page}, ${data.data.length}/${data.total} results`);
      return HttpResponse.json(data);
    } catch (error) {
      console.error('❌ MSW: Jobs GET error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await networkDelay();
    
    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }

    try {
      const jobId = parseInt(params.id);
      console.log('🔍 MSW: Getting job with ID:', params.id, '→', jobId);
      
      if (isNaN(jobId)) {
        return HttpResponse.json({ error: 'Invalid job ID' }, { status: 400 });
      }
      
      const job = await dataService.getJob(jobId);
      console.log('🔍 MSW: Job result:', job ? `Found: ${job.title}` : 'Not found');
      
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      console.log(`✅ MSW: Job GET - ${job.title} (ID: ${params.id})`);
      return HttpResponse.json(job);
    } catch (error) {
      console.error('❌ MSW: Error getting job:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await networkDelay();

    // 10% error rate for testing
    if (Math.random() < 0.1) {
      console.log('❌ Simulated job POST error');
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 400 });
    }

    try {
      const jobData = await request.json();
      const newJob = await dataService.createJob(jobData);
      
      console.log(`✅ MSW: Created job - ${newJob.title} (slug: ${newJob.slug})`);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      console.error('❌ MSW: Job POST error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated job PATCH error for job ${params.id}`);
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    try {
      const updates = await request.json();
      const updatedJob = await dataService.updateJob(parseInt(params.id), updates);
      
      console.log(`✅ MSW: Updated job ${params.id} - ${updatedJob?.title}`);
      return HttpResponse.json(updatedJob);
    } catch (error) {
      console.error('❌ MSW: Job PATCH error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await networkDelay();

    // 10% failure rate for rollback testing
    if (Math.random() < 0.1) {
      console.log(`❌ Simulated reorder failure for job ${params.id}`);
      return HttpResponse.json(
        { error: 'Reorder failed - testing rollback mechanism' }, 
        { status: 500 }
      );
    }

    try {
      const { fromOrder, toOrder } = await request.json();
      const jobId = parseInt(params.id);
      
      console.log(`🔄 MSW: Reordering job ${jobId}: ${fromOrder} → ${toOrder}`);
      
      // Get all jobs to reorder
      const allJobsData = await dataService.getJobs(1, 100);
      const jobs = [...allJobsData.data].sort((a, b) => a.order - b.order);
      
      // Find the job to move
      const jobToMove = jobs.find(job => job.id === jobId);
      if (!jobToMove) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      // Remove job from current position and insert at new position
      const filteredJobs = jobs.filter(job => job.id !== jobId);
      filteredJobs.splice(toOrder, 0, jobToMove);
      
      // Update order values for all jobs
      const reorderedJobs = filteredJobs.map((job, index) => ({
        ...job,
        order: index
      }));

      await dataService.reorderJobs(reorderedJobs);
      
      console.log(`✅ MSW: Reordered job ${jobId} from order ${fromOrder} to ${toOrder}`);
      return HttpResponse.json({ success: true, newOrder: toOrder });
    } catch (error) {
      console.error('❌ MSW: Reorder error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // 👥 CANDIDATES ENDPOINTS
  http.get('/api/candidates', async ({ request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      console.log('❌ Simulated candidates GET error');
      return HttpResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    try {
      // For Kanban board (large pageSize), return all candidates
      if (pageSize >= 2000) {
        const allCandidates = await dataService.getAllCandidates();
        const filteredCandidates = allCandidates.filter(candidate => {
          if (search && !(
            candidate.name.toLowerCase().includes(search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(search.toLowerCase())
          )) return false;
          
          if (stage && stage !== 'all' && candidate.stage !== stage) return false;
          if (jobId && jobId !== 'all' && candidate.jobId !== parseInt(jobId)) return false;
          
          return true;
        });

        console.log(`✅ MSW: All Candidates GET - ${filteredCandidates.length} candidates for Kanban`);
        return HttpResponse.json({ 
          data: filteredCandidates, 
          total: filteredCandidates.length, 
          page: 1, 
          pageSize: filteredCandidates.length, 
          totalPages: 1 
        });
      }

      // Regular paginated request
      const data = await dataService.getCandidates(page, pageSize, { 
        search, 
        stage: stage === 'all' ? '' : stage,
        jobId: jobId === 'all' ? '' : jobId
      });
      
      console.log(`✅ MSW: Candidates GET - page ${page}, ${data.data.length}/${data.total} results`);
      return HttpResponse.json(data);
    } catch (error) {
      console.error('❌ MSW: Candidates GET error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated candidate GET error for candidate ${params.id}`);
      return HttpResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
    }

    try {
      const candidate = await dataService.getCandidate(parseInt(params.id));
      if (!candidate) {
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      console.log(`✅ MSW: Candidate GET - ${candidate.name} (ID: ${params.id})`);
      return HttpResponse.json(candidate);
    } catch (error) {
      console.error('❌ MSW: Candidate GET error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated candidate PATCH error for candidate ${params.id}`);
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }

    try {
      const updates = await request.json();
      const updatedCandidate = await dataService.updateCandidate(parseInt(params.id), updates);
      
      console.log(`✅ MSW: Updated candidate ${params.id} - ${updatedCandidate.name} → ${updatedCandidate.stage}`);
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      console.error('❌ MSW: Candidate PATCH error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Failed to add note' }, { status: 500 });
    }

    try {
      const noteData = await request.json();
      const newNote = await dataService.addCandidateNote(parseInt(params.id), noteData);
      
      console.log(`✅ MSW: Added note to candidate ${params.id}`);
      return HttpResponse.json(newNote, { status: 201 });
    } catch (error) {
      console.error('❌ MSW: Add note error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // 📋 ASSESSMENTS ENDPOINTS
  http.get('/api/assessments', async ({ request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') || 'all';

    try {
      const data = await dataService.getAssessments({ 
        jobId: jobId === 'all' ? '' : jobId 
      });
      
      console.log(`✅ MSW: Assessments GET - ${data.length} assessments`);
      return HttpResponse.json(data);
    } catch (error) {
      console.error('❌ MSW: Assessments GET error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // Get assessment BY JOB ID (not assessment ID)
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }

    try {
      const jobId = parseInt(params.jobId);
      console.log('🔍 MSW: Getting assessment for job ID:', jobId);
      
      // Get assessment BY JOB ID, not by assessment ID
      const assessments = await dataService.getAssessments();
      const assessment = assessments.find(a => a.jobId === jobId);
      
      if (!assessment) {
        console.log(`❌ MSW: No assessment found for job ${jobId}`);
        return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      console.log(`✅ MSW: Assessment GET - ${assessment.title} (Job ID: ${jobId})`);
      return HttpResponse.json(assessment);
    } catch (error) {
      console.error('❌ MSW: Error getting assessment:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/assessments', async ({ request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    try {
      const assessmentData = await request.json();
      const newAssessment = await dataService.createAssessment(assessmentData);
      
      console.log(`✅ MSW: Created assessment - ${newAssessment.title}`);
      return HttpResponse.json(newAssessment, { status: 201 });
    } catch (error) {
      console.error('❌ MSW: Assessment POST error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // PUT assessment BY JOB ID (create or update)
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      return HttpResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
    }

    try {
      const jobId = parseInt(params.jobId);
      const assessmentData = await request.json();
      
      // Find existing assessment for this job
      const assessments = await dataService.getAssessments();
      const existingAssessment = assessments.find(a => a.jobId === jobId);
      
      let result;
      if (existingAssessment) {
        // Update existing
        result = await dataService.updateAssessment(existingAssessment.id, {
          ...assessmentData,
          jobId,
          id: existingAssessment.id
        });
        console.log(`✅ MSW: Updated existing assessment for job ${jobId} - ${result.title}`);
      } else {
        // Create new
        const newAssessmentData = { ...assessmentData };
        delete newAssessmentData.id;
        newAssessmentData.jobId = jobId;
        
        result = await dataService.createAssessment(newAssessmentData);
        console.log(`✅ MSW: Created new assessment for job ${jobId} - ${result.title}`);
      }
      
      return HttpResponse.json(result);
    } catch (error) {
      console.error(`❌ MSW: Error saving assessment for job ${params.jobId}:`, error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // Assessment submission
  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    console.log('🎯 MSW: Assessment submission received for job ID:', params.jobId);
    await networkDelay();

    // 5% error rate
    if (Math.random() < 0.05) {
      console.log(`❌ Simulated assessment submission error for job ${params.jobId}`);
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }

    try {
      const submissionData = await request.json();
      console.log('📝 MSW: Submission data:', submissionData);

      // Calculate score
      const answers = submissionData.answers || {};
      const totalQuestions = Object.keys(answers).length;
      const answeredQuestions = Object.values(answers).filter(answer => {
        if (Array.isArray(answer)) return answer.length > 0;
        return answer && answer.toString().trim() !== '';
      }).length;
      
      const score = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

      const submission = await dataService.submitAssessment({
        ...submissionData,
        jobId: parseInt(params.jobId),
        score,
        completionPercentage: score
      });

      console.log(`✅ MSW: Assessment submitted for job ${params.jobId} - score ${score}%`);
      
      return HttpResponse.json({ 
        success: true,
        submissionId: submission.id,
        submittedAt: submission.completedAt,
        score: submission.score,
        completionPercentage: submission.completionPercentage || score,
        message: 'Assessment submitted successfully'
      });
    } catch (error) {
      console.error('❌ MSW: Assessment submission error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.get('/api/assessments/:jobId/submissions', async ({ params }) => {
    await networkDelay();

    try {
      const jobId = parseInt(params.jobId);
      
      // Find assessment for this job first
      const assessments = await dataService.getAssessments();
      const assessment = assessments.find(a => a.jobId === jobId);
      
      if (!assessment) {
        return HttpResponse.json([]);
      }

      const submissions = await dataService.getSubmissions(assessment.id);
      
      console.log(`✅ MSW: Submissions GET for job ${jobId} - ${submissions.length} submissions`);
      return HttpResponse.json(submissions);
    } catch (error) {
      console.error('❌ MSW: Submissions GET error:', error);
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  })
];
