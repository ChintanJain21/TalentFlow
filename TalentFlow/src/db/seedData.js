// Seed data generators for initial database population
export const generateJobs = () => {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR'];
  const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA'];
  const types = ['Full-time', 'Part-time', 'Contract'];
  const experiences = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  const jobTitles = [
    'Senior React Developer', 'Full Stack Engineer', 'UI/UX Designer', 
    'Product Manager', 'DevOps Engineer', 'Data Scientist',
    'Backend Developer', 'Frontend Engineer', 'Marketing Manager',
    'Sales Representative', 'HR Business Partner', 'QA Engineer',
    'Mobile Developer', 'System Administrator', 'Business Analyst',
    'Content Writer', 'Graphic Designer', 'Project Manager',
    'Customer Success Manager', 'Operations Manager', 'Finance Manager',
    'Legal Counsel', 'Security Engineer', 'Machine Learning Engineer',
    'Technical Writer'
  ];

  return jobTitles.map((title, index) => ({
    id: index + 1,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    status: Math.random() > 0.7 ? 'archived' : 'active',
    department: departments[Math.floor(Math.random() * departments.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    type: types[Math.floor(Math.random() * types.length)],
    experience: experiences[Math.floor(Math.random() * experiences.length)],
    salary: {
      min: 60000 + Math.floor(Math.random() * 80000),
      max: 80000 + Math.floor(Math.random() * 120000)
    },
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'SQL'].slice(0, 2 + Math.floor(Math.random() * 3)),
    description: `We are looking for a talented ${title} to join our ${departments[Math.floor(Math.random() * departments.length)]} team.`,
    requirements: [
      `3+ years of experience in ${title.toLowerCase()}`,
      'Strong communication skills',
      'Team player with leadership qualities'
    ],
    benefits: ['Health Insurance', 'Remote Work', '401k Match', 'Flexible PTO'],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    order: index + 1
  }));
};
export const generateCandidates = () => {
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'William', 'Maria', 'James', 'Jennifer', 'Christopher', 'Michelle', 'Daniel',
    'Jessica', 'Matthew', 'Ashley', 'Anthony', 'Amanda', 'Mark', 'Stephanie'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];

  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Philadelphia, PA', 'Phoenix, AZ', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
  ];

  const skills = [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'HTML', 'CSS',
    'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Git'
  ];

  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  return Array.from({ length: 1000 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    
    // ✅ ENSURE GOOD DISTRIBUTION: More candidates for jobs 1-10, fewer for others
    const jobId = index < 500 
      ? Math.floor(Math.random() * 10) + 1  // First 500 candidates go to jobs 1-10
      : Math.floor(Math.random() * 15) + 11; // Remaining 500 go to jobs 11-25
    
    return {
      id: index + 1,
      name,
      email,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      experience: Math.floor(Math.random() * 15) + 1,
      salary: 40000 + Math.floor(Math.random() * 160000),
      location: locations[Math.floor(Math.random() * locations.length)],
      skills: skills.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 5)),
      resume: `https://example.com/resumes/${name.replace(' ', '-').toLowerCase()}.pdf`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      github: Math.random() > 0.5 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      appliedDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
      jobId: jobId, // ✅ FIXED: Better job distribution
      notes: [],
      timeline: [
        {
          id: Date.now() + Math.random(),
          stage: 'applied',
          note: `Applied for the position`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
          user: 'System',
          type: 'stage_change'
        }
      ]
    };
  });
};

export const generateAssessments = () => {
  return [
    {
      id: 1,
      title: 'Senior React Developer Assessment',
      description: 'Comprehensive evaluation of React, JavaScript, and Frontend skills',
      jobId: 1,
      sections: [
        {
          id: 1,
          title: 'React Fundamentals',
          questions: [
            {
              id: 1,
              type: 'single-choice',
              title: 'What is the purpose of useEffect hook in React?',
              required: true,
              options: [
                'To manage component state',
                'To handle side effects in functional components',
                'To create reusable components',
                'To optimize performance'
              ],
              correctAnswer: 1
            },
            {
              id: 2,
              type: 'single-choice',
              title: 'Which method is used to update state in a class component?',
              required: true,
              options: ['setState()', 'updateState()', 'changeState()', 'modifyState()'],
              correctAnswer: 0
            },
            {
              id: 3,
              type: 'multi-choice',
              title: 'Select all valid React lifecycle methods:',
              required: true,
              options: ['componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillMount'],
              correctAnswers: [0, 2]
            },
            {
              id: 4,
              type: 'short-text',
              title: 'Write a function component that accepts a "name" prop:',
              required: true,
              placeholder: 'const Greeting = ({ name }) => { ... }'
            }
          ]
        },
        {
          id: 2,
          title: 'JavaScript Skills',
          questions: [
            {
              id: 5,
              type: 'single-choice',
              title: 'What does "hoisting" mean in JavaScript?',
              required: true,
              options: [
                'Moving variables to global scope',
                'Lifting declarations to the top of scope',
                'Optimizing code performance',
                'Creating closures'
              ],
              correctAnswer: 1
            },
            {
              id: 6,
              type: 'long-text',
              title: 'Write a function that reverses a string:',
              required: true,
              placeholder: 'function reverseString(str) {\n  // Your code here\n  return reversedString;\n}'
            },
            {
              id: 7,
              type: 'multi-choice',
              title: 'Select ES6+ features:',
              required: true,
              options: ['Arrow functions', 'Template literals', 'var keyword', 'Destructuring'],
              correctAnswers: [0, 1, 3]
            },
            {
              id: 8,
              type: 'numeric',
              title: 'How many years of React experience do you have?',
              required: true,
              min: 0,
              max: 20
            }
          ]
        },
        {
          id: 3,
          title: 'Problem Solving',
          questions: [
            {
              id: 9,
              type: 'long-text',
              title: 'How would you optimize a slow React component?',
              required: true,
              placeholder: 'Describe your optimization approach...'
            },
            {
              id: 10,
              type: 'file-upload',
              title: 'Upload your portfolio or sample React project:',
              required: false,
              acceptedTypes: ['.zip', '.pdf', '.jpg', '.png']
            }
          ]
        }
      ],
      timeLimit: 45,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    },
    
    {
      id: 2,
      title: 'Full Stack Engineer Assessment',
      description: 'Technical evaluation covering frontend and backend skills',
      jobId: 2,
      sections: [
        {
          id: 1,
          title: 'Backend Development',
          questions: [
            {
              id: 1,
              type: 'single-choice',
              title: 'What is middleware in Express.js?',
              required: true,
              options: [
                'Database connections',
                'Request-response cycle functions',
                'Authentication only',
                'Static file serving'
              ],
              correctAnswer: 1
            },
            {
              id: 2,
              type: 'multi-choice',
              title: 'Select valid HTTP methods:',
              required: true,
              options: ['GET', 'POST', 'PUT', 'FETCH'],
              correctAnswers: [0, 1, 2]
            },
            {
              id: 3,
              type: 'long-text',
              title: 'Write a REST API endpoint to get all users:',
              required: true,
              placeholder: 'app.get("/users", (req, res) => {\n  // Your code here\n});'
            },
            {
              id: 4,
              type: 'numeric',
              title: 'What HTTP status code represents "Not Found"?',
              required: true,
              min: 100,
              max: 599
            }
          ]
        },
        {
          id: 2,
          title: 'Frontend Skills',
          questions: [
            {
              id: 5,
              type: 'single-choice',
              title: 'Best place to make API calls in React?',
              required: true,
              options: ['render method', 'useEffect hook', 'constructor', 'componentWillMount'],
              correctAnswer: 1
            },
            {
              id: 6,
              type: 'short-text',
              title: 'Name a React state management library:',
              required: true,
              placeholder: 'e.g., Redux, Zustand...'
            },
            {
              id: 7,
              type: 'multi-choice',
              title: 'Select CSS frameworks you know:',
              required: false,
              options: ['Bootstrap', 'Tailwind CSS', 'Bulma', 'Foundation'],
              correctAnswers: []
            },
            {
              id: 8,
              type: 'file-upload',
              title: 'Upload a screenshot of your best UI:',
              required: false,
              acceptedTypes: ['.jpg', '.png', '.gif']
            }
          ]
        },
        {
          id: 3,
          title: 'System Design',
          questions: [
            {
              id: 9,
              type: 'long-text',
              title: 'Design a simple todo app architecture:',
              required: true,
              placeholder: 'Frontend:\n- Components\n- State\n\nBackend:\n- API\n- Database'
            },
            {
              id: 10,
              type: 'single-choice',
              title: 'Main benefit of REST APIs?',
              required: true,
              options: [
                'JavaScript only',
                'Stateless & HTTP methods',
                'Less resources',
                'Auto authentication'
              ],
              correctAnswer: 1
            }
          ]
        }
      ],
      timeLimit: 60,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    },
    
    {
      id: 3,
      title: 'UI/UX Designer Assessment',
      description: 'Design thinking and user experience evaluation',
      jobId: 3,
      sections: [
        {
          id: 1,
          title: 'Design Principles',
          questions: [
            {
              id: 1,
              type: 'single-choice',
              title: 'Primary goal of user-centered design?',
              required: true,
              options: [
                'Beautiful designs',
                'Focus on user needs',
                'Latest trends',
                'Minimize costs'
              ],
              correctAnswer: 1
            },
            {
              id: 2,
              type: 'multi-choice',
              title: 'Key principles of good UI design:',
              required: true,
              options: ['Consistency', 'Complexity', 'Clarity', 'Accessibility'],
              correctAnswers: [0, 2, 3]
            },
            {
              id: 3,
              type: 'short-text',
              title: 'What is a wireframe used for?',
              required: true,
              placeholder: 'Brief explanation...'
            },
            {
              id: 4,
              type: 'numeric',
              title: 'How many years of design experience do you have?',
              required: true,
              min: 0,
              max: 30
            }
          ]
        },
        {
          id: 2,
          title: 'UX Research',
          questions: [
            {
              id: 5,
              type: 'single-choice',
              title: 'Purpose of user personas?',
              required: true,
              options: [
                'Represent user groups',
                'Marketing materials',
                'Development timelines',
                'Project budgets'
              ],
              correctAnswer: 0
            },
            {
              id: 6,
              type: 'long-text',
              title: 'How would you conduct usability testing?',
              required: true,
              placeholder: 'Describe your testing methodology...'
            },
            {
              id: 7,
              type: 'multi-choice',
              title: 'Select UX research methods:',
              required: true,
              options: ['User interviews', 'A/B testing', 'Surveys', 'Code reviews'],
              correctAnswers: [0, 1, 2]
            },
            {
              id: 8,
              type: 'file-upload',
              title: 'Upload your design portfolio:',
              required: false,
              acceptedTypes: ['.pdf', '.zip', '.jpg', '.png']
            }
          ]
        },
        {
          id: 3,
          title: 'Tools & Process',
          questions: [
            {
              id: 9,
              type: 'long-text',
              title: 'Describe your design process:',
              required: true,
              placeholder: 'Research → Ideation → Wireframing → Prototyping → Testing...'
            },
            {
              id: 10,
              type: 'multi-choice',
              title: 'Design tools you use:',
              required: false,
              options: ['Figma', 'Sketch', 'Adobe XD', 'InVision'],
              correctAnswers: []
            }
          ]
        }
      ],
      timeLimit: 40,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    }
  ];
};
