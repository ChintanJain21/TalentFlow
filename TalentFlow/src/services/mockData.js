
export const generateJobs = (count = 25) => {
  const titles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'React Developer', 'Node.js Developer', 'Python Developer',
    'DevOps Engineer', 'Data Scientist', 'UI/UX Designer',
    'Product Manager', 'QA Engineer', 'Mobile Developer',
    'Software Architect', 'Machine Learning Engineer', 'Cloud Engineer',
    'Security Engineer', 'Database Administrator', 'System Administrator',
    'Technical Writer', 'Project Manager', 'Scrum Master',
    'Business Analyst', 'Sales Engineer', 'Customer Success Manager',
    'Marketing Manager'
  ];

  const companies = ['TechCorp', 'StartupHub', 'InnovateLab', 'DataFlow', 'CloudFirst'];
  const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Bangalore'];
  const allTags = ['javascript', 'react', 'node', 'python', 'aws', 'docker', 'kubernetes', 'typescript', 'vue', 'angular'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    slug: titles[i % titles.length].toLowerCase().replace(/\s+/g, '-'),
    company: companies[Math.floor(Math.random() * companies.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    status: Math.random() > 0.3 ? 'active' : 'archived',
    tags: allTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
    order: i,
    description: `We are looking for a skilled ${titles[i % titles.length]} to join our dynamic team and contribute to exciting projects.`,
    requirements: [
      '3+ years of relevant experience',
      'Strong problem-solving skills',
      'Team collaboration abilities',
      'Excellent communication skills'
    ],
    salary: `$${Math.floor(Math.random() * 50 + 80)}k - $${Math.floor(Math.random() * 50 + 120)}k`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

// 🚀 FIXED VERSION - GUARANTEED 1000 UNIQUE CANDIDATES
// 🚀 DETERMINISTIC CANDIDATE GENERATION
export const generateCandidates = (count = 1000) => {
  // Simple seeded random function
  let seed = 12345; // Fixed seed for consistent results
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna', 'Robert', 'Maria', 'James', 'Jessica', 'Michael', 'Emma', 'William', 'Olivia', 'Alexander', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Owen', 'Mia', 'Elijah', 'Harper', 'Sebastian', 'Evelyn', 'Jack', 'Abigail', 'Leo', 'Emily', 'Jacob', 'Elizabeth', 'Logan', 'Sofia', 'Daniel', 'Avery', 'Jackson', 'Ella', 'Samuel', 'Madison', 'Matthew', 'Scarlett', 'David', 'Victoria'];
  
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores'];
  
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH', 'NC', 'CA', 'IN', 'WA', 'CO', 'DC', 'MA', 'TX', 'TN', 'MI', 'OK'];
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'TypeScript', 'Vue', 'Angular', 'SQL', 'MongoDB', 'GraphQL', 'Express', 'Redux', 'Next.js', 'PostgreSQL', 'Git', 'Kubernetes', 'Jenkins', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native'];

  // Generate realistic timeline for each candidate
  const generateTimeline = (appliedDate, currentStage) => {
    const timeline = [
      {
        id: 1,
        stage: 'applied',
        timestamp: appliedDate.toISOString(),
        note: 'Application received',
        user: 'System'
      }
    ];

    const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const currentStageIndex = stageOrder.indexOf(currentStage);
    
    if (currentStageIndex > 0) {
      let currentDate = new Date(appliedDate);
      
      for (let i = 1; i <= currentStageIndex; i++) {
        // Use seeded random for consistent timeline progression
        currentDate = new Date(currentDate.getTime() + (seededRandom() * 7 + 1) * 24 * 60 * 60 * 1000);
        
        timeline.push({
          id: i + 1,
          stage: stageOrder[i],
          timestamp: currentDate.toISOString(),
          note: `Moved to ${stageOrder[i]} stage`,
          user: `HR User ${Math.floor(seededRandom() * 3) + 1}`
        });
      }
    }
    
    return timeline;
  };

  return Array.from({ length: count }, (_, i) => {
    // 🚀 DETERMINISTIC NAME GENERATION
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const uniqueSuffix = Math.floor(i / (firstNames.length * lastNames.length)) + 1;
    const finalFirstName = uniqueSuffix > 1 ? `${firstName}${uniqueSuffix}` : firstName;
    
    // 🚀 USE SEEDED RANDOM FOR ALL RANDOM VALUES
    const stage = stages[Math.floor(seededRandom() * stages.length)];
    const appliedDate = new Date(Date.now() - seededRandom() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
    const cityIndex = Math.floor(seededRandom() * cities.length);
    
    // Seeded random selections
    const selectedSkills = [];
    const skillCount = Math.floor(seededRandom() * 6) + 3; // 3-8 skills
    for (let j = 0; j < skillCount; j++) {
      const skill = skills[Math.floor(seededRandom() * skills.length)];
      if (!selectedSkills.includes(skill)) {
        selectedSkills.push(skill);
      }
    }
    
    return {
      id: i + 1,
      name: `${finalFirstName} ${lastName}`,
      email: `${finalFirstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
      phone: `+1-${Math.floor(seededRandom() * 900 + 100)}-${Math.floor(seededRandom() * 900 + 100)}-${Math.floor(seededRandom() * 9000 + 1000)}`,
      stage: stage,
      jobId: Math.floor(seededRandom() * 25) + 1,
      appliedDate: appliedDate.toISOString(),
      updatedAt: new Date(appliedDate.getTime() + seededRandom() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: `${cities[cityIndex]}, ${states[cityIndex]}`,
      experience: Math.floor(seededRandom() * 15) + 1, // 1-15 years
      salary: Math.floor(seededRandom() * 120000) + 50000, // $50k-$170k
      skills: selectedSkills,
      resume: `https://example.com/resumes/${finalFirstName.toLowerCase()}-${lastName.toLowerCase()}-resume.pdf`,
      linkedin: `https://linkedin.com/in/${finalFirstName.toLowerCase()}-${lastName.toLowerCase()}${i + 1}`,
      github: seededRandom() > 0.3 ? `https://github.com/${finalFirstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}` : null,
      notes: seededRandom() > 0.7 ? [
        {
          id: 1,
          content: `Initial interview feedback: ${['Strong technical skills', 'Good communication', 'Team player', 'Needs improvement in X'][Math.floor(seededRandom() * 4)]}`,
          author: `HR User ${Math.floor(seededRandom() * 3) + 1}`,
          timestamp: new Date(appliedDate.getTime() + seededRandom() * 20 * 24 * 60 * 60 * 1000).toISOString(),
          mentions: []
        }
      ] : [],
      timeline: generateTimeline(appliedDate, stage)
    };
  });
};



export const generateAssessments = () => {
  return [
    {
      id: 1,
      jobId: 1, // Frontend Developer
      title: 'Frontend Developer Technical Assessment',
      description: 'Comprehensive assessment for frontend development skills',
      sections: [
        {
          id: 'section-1',
          title: 'Technical Skills',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'What is your primary frontend framework?',
              required: true,
              options: ['React', 'Vue', 'Angular', 'Svelte']
            },
            {
              id: 'q2',
              type: 'multi-choice',
              title: 'Which CSS preprocessors have you used?',
              required: false,
              options: ['Sass', 'Less', 'Stylus', 'PostCSS']
            },
            {
              id: 'q3',
              type: 'short-text',
              title: 'Years of JavaScript experience?',
              required: true,
              validation: { maxLength: 10 }
            },
            {
              id: 'q4',
              type: 'long-text',
              title: 'Describe your experience with React hooks and state management',
              required: false,
              validation: { maxLength: 500 }
            },
            {
              id: 'q5',
              type: 'numeric',
              title: 'How many React projects have you completed?',
              required: true,
              validation: { min: 0, max: 100 }
            },
            {
              id: 'q6',
              type: 'single-choice',
              title: 'Which testing framework do you prefer for React?',
              required: true,
              options: ['Jest', 'Vitest', 'Cypress', 'Playwright']
            },
            {
              id: 'q7',
              type: 'multi-choice',
              title: 'Which state management libraries have you used?',
              required: false,
              options: ['Redux', 'Zustand', 'Context API', 'MobX', 'Recoil']
            },
            {
              id: 'q8',
              type: 'short-text',
              title: 'What is your preferred bundler for React applications?',
              required: false,
              validation: { maxLength: 50 }
            },
            {
              id: 'q9',
              type: 'single-choice',
              title: 'How do you handle API calls in React?',
              required: true,
              options: ['Fetch API', 'Axios', 'React Query', 'SWR']
            },
            {
              id: 'q10',
              type: 'long-text',
              title: 'Explain the difference between controlled and uncontrolled components in React',
              required: true,
              validation: { maxLength: 300 }
            },
            {
              id: 'q11',
              type: 'numeric',
              title: 'Rate your CSS Grid skills (1-10)',
              required: true,
              validation: { min: 1, max: 10 }
            }
          ]
        }
      ]
    },
    {
      id: 2,
      jobId: 7, // DevOps Engineer
      title: 'DevOps Engineer Technical Assessment',
      description: 'Assessment for DevOps and infrastructure skills',
      sections: [
        {
          id: 'section-1',
          title: 'DevOps Tools & Practices',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'Primary cloud provider you work with?',
              required: true,
              options: ['AWS', 'Azure', 'Google Cloud', 'DigitalOcean']
            },
            {
              id: 'q2',
              type: 'multi-choice',
              title: 'Which containerization tools have you used?',
              required: true,
              options: ['Docker', 'Kubernetes', 'Podman', 'containerd']
            },
            {
              id: 'q3',
              type: 'short-text',
              title: 'Years of DevOps experience?',
              required: true,
              validation: { maxLength: 10 }
            },
            {
              id: 'q4',
              type: 'single-choice',
              title: 'Preferred CI/CD platform?',
              required: true,
              options: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI']
            },
            {
              id: 'q5',
              type: 'multi-choice',
              title: 'Which monitoring tools have you implemented?',
              required: false,
              options: ['Prometheus', 'Grafana', 'Datadog', 'New Relic', 'CloudWatch']
            },
            {
              id: 'q6',
              type: 'long-text',
              title: 'Describe your experience with Infrastructure as Code',
              required: true,
              validation: { maxLength: 400 }
            },
            {
              id: 'q7',
              type: 'single-choice',
              title: 'Primary scripting language for automation?',
              required: true,
              options: ['Bash', 'Python', 'PowerShell', 'Go']
            },
            {
              id: 'q8',
              type: 'numeric',
              title: 'How many production deployments do you handle per month?',
              required: false,
              validation: { min: 0, max: 1000 }
            },
            {
              id: 'q9',
              type: 'short-text',
              title: 'Favorite Infrastructure as Code tool?',
              required: false,
              validation: { maxLength: 50 }
            },
            {
              id: 'q10',
              type: 'multi-choice',
              title: 'Which security practices do you implement?',
              required: true,
              options: ['Secret Management', 'Network Policies', 'RBAC', 'Security Scanning', 'Compliance Auditing']
            },
            {
              id: 'q11',
              type: 'long-text',
              title: 'Explain your disaster recovery strategy',
              required: false,
              validation: { maxLength: 300 }
            }
          ]
        }
      ]
    },
    {
      id: 3,
      jobId: 8, // Data Scientist
      title: 'Data Scientist Technical Assessment',
      description: 'Assessment for data science and analytics skills',
      sections: [
        {
          id: 'section-1',
          title: 'Data Science Skills',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'Primary programming language for data science?',
              required: true,
              options: ['Python', 'R', 'Julia', 'Scala']
            },
            {
              id: 'q2',
              type: 'multi-choice',
              title: 'Which ML libraries have you used?',
              required: true,
              options: ['scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'XGBoost']
            },
            {
              id: 'q3',
              type: 'numeric',
              title: 'Years of data science experience?',
              required: true,
              validation: { min: 0, max: 20 }
            },
            {
              id: 'q4',
              type: 'single-choice',
              title: 'Preferred data visualization library?',
              required: true,
              options: ['Matplotlib', 'Seaborn', 'Plotly', 'ggplot2']
            },
            {
              id: 'q5',
              type: 'multi-choice',
              title: 'Which databases have you worked with?',
              required: false,
              options: ['PostgreSQL', 'MySQL', 'MongoDB', 'BigQuery', 'Snowflake']
            },
            {
              id: 'q6',
              type: 'long-text',
              title: 'Describe your approach to feature engineering',
              required: true,
              validation: { maxLength: 400 }
            },
            {
              id: 'q7',
              type: 'single-choice',
              title: 'Primary tool for data manipulation?',
              required: true,
              options: ['Pandas', 'NumPy', 'dplyr', 'data.table']
            },
            {
              id: 'q8',
              type: 'short-text',
              title: 'Favorite machine learning algorithm?',
              required: false,
              validation: { maxLength: 50 }
            },
            {
              id: 'q9',
              type: 'multi-choice',
              title: 'Which model evaluation metrics do you commonly use?',
              required: true,
              options: ['Accuracy', 'Precision/Recall', 'ROC-AUC', 'F1-Score', 'RMSE']
            },
            {
              id: 'q10',
              type: 'numeric',
              title: 'Rate your statistical knowledge (1-10)',
              required: true,
              validation: { min: 1, max: 10 }
            },
            {
              id: 'q11',
              type: 'long-text',
              title: 'Explain your process for handling missing data',
              required: false,
              validation: { maxLength: 300 }
            }
          ]
        }
      ]
    }
  ];
};

// Global storage for session persistence
let jobsData = generateJobs();
let candidatesData = generateCandidates();
let assessmentsData = generateAssessments();

// Getters
export const getJobsData = () => jobsData;
export const getCandidatesData = () => candidatesData;
export const getAssessmentsData = () => assessmentsData;

// Setters
export const updateJobsData = (newJobs) => {
  jobsData = newJobs;
};

export const updateCandidatesData = (newCandidates) => {
  candidatesData = newCandidates;
};

export const updateAssessmentsData = (newAssessments) => {
  assessmentsData = newAssessments;
};
