require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Event = require('./models/Event');
const SavedJob = require('./models/SavedJob');
const Notification = require('./models/Notification'); // ensure it clears out properly

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const avatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/85.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/94.jpg',
];

const companyLogos = [
  'https://logo.clearbit.com/google.com',
  'https://logo.clearbit.com/microsoft.com',
  'https://logo.clearbit.com/apple.com',
  'https://logo.clearbit.com/netflix.com',
  'https://logo.clearbit.com/spotify.com'
];

const seedData = async () => {
  await connectDB();

  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Event.deleteMany();
    await SavedJob.deleteMany();

    // Some models might not be imported at top level if not strictly needed but let's clear notifications too if it exists
    if (mongoose.models.Notification) {
      await mongoose.models.Notification.deleteMany();
    }
    console.log('Database cleared.');

    // 1. Create Employers (5)
    console.log('Creating Employers...');
    const employers = [];
    const companies = [
      { name: 'TechNova', email: 'hr@technova.com', desc: 'Leading the future of AI and Cloud Infrastructure.' },
      { name: 'Globex Corp', email: 'careers@globex.com', desc: 'Global logistics and supply chain optimization software.' },
      { name: 'Quantum Solutions', email: 'jobs@quantum.com', desc: 'Building next-generation quantum computing applications.' },
      { name: 'FinSync', email: 'talent@finsync.io', desc: 'Disrupting the modern fintech and payment processing sector.' },
      { name: 'GreenEnergy Tech', email: 'eco@greenenergy.com', desc: 'Software for sustainable energy tracking and management.' },
    ];

    for (let i = 0; i < companies.length; i++) {
      const emp = await User.create({
        fullName: `${companies[i].name} HR`,
        email: companies[i].email,
        password: 'Password123!',
        role: 'employer',
        companyName: companies[i].name,
        companyDescription: companies[i].desc,
        companyLogo: companyLogos[i],
        location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Berlin, Germany'][i]
      });
      employers.push(emp);
    }

    // 2. Create Job Seekers (10)
    console.log('Creating Job Seekers...');
    const seekers = [];
    const seekerDetails = [
      { name: 'Alex Johnson', college: 'Stanford University', skills: ['React', 'Node.js', 'MongoDB'], loc: 'San Francisco, CA' },
      { name: 'Sarah Williams', college: 'MIT', skills: ['Python', 'Machine Learning', 'TensorFlow'], loc: 'Boston, MA' },
      { name: 'Michael Chen', college: 'UC Berkeley', skills: ['Java', 'Spring Boot', 'AWS'], loc: 'San Jose, CA' },
      { name: 'Emily Davis', college: 'NYU', skills: ['UX Design', 'Figma', 'User Research'], loc: 'New York, NY' },
      { name: 'David Miller', college: 'University of Texas', skills: ['DevOps', 'Docker', 'Kubernetes'], loc: 'Austin, TX' },
      { name: 'Jessica Wilson', college: 'Georgia Tech', skills: ['Cybersecurity', 'Network Sec', 'Linux'], loc: 'Atlanta, GA' },
      { name: 'Robert Moore', college: 'University of Michigan', skills: ['C++', 'Systems Programming', 'Rust'], loc: 'Ann Arbor, MI' },
      { name: 'Linda Taylor', college: 'UCLA', skills: ['Product Management', 'Agile', 'Scrum'], loc: 'Los Angeles, CA' },
      { name: 'William Anderson', college: 'Harvard University', skills: ['Data Analysis', 'SQL', 'Tableau'], loc: 'Boston, MA' },
      { name: 'Elizabeth Thomas', college: 'University of Washington', skills: ['Cloud Architecture', 'Azure', 'GCP'], loc: 'Seattle, WA' }
    ];

    for (let i = 0; i < seekerDetails.length; i++) {
      const s = await User.create({
        fullName: seekerDetails[i].name,
        email: `candidate${i + 1}@demo.com`,
        password: 'Password123!',
        role: 'jobSeeker',
        profileImage: avatars[i],
        location: seekerDetails[i].loc,
        education: seekerDetails[i].college,
        skills: seekerDetails[i].skills,
        certifications: ['AWS Certified', 'Scrum Master', 'CompTIA Security+'].slice(0, (i % 3) + 1),
        about: `I am a skilled professional passionate about building great products. Graduated from ${seekerDetails[i].college}.`
      });
      seekers.push(s);
    }

    // 3. Setup Following connections (Network)
    console.log('Establishing Followers...');
    for (let s of seekers) {
      // Each seeker follows 2 random employers
      const emp1 = employers[Math.floor(Math.random() * employers.length)];
      let emp2 = employers[Math.floor(Math.random() * employers.length)];
      while (emp1._id === emp2._id) { emp2 = employers[Math.floor(Math.random() * employers.length)]; }

      s.following.push(emp1._id, emp2._id);
      emp1.followers.push(s._id);
      emp2.followers.push(s._id);
      await s.save();
      await emp1.save();
      await emp2.save();
    }

    // 4. Create Jobs (15+)
    console.log('Creating Jobs...');
    const jobData = [
      { t: 'Senior Frontend Engineer', cat: 'Software Development', type: 'Full-time', cap: 2 },
      { t: 'Backend Developer', cat: 'Software Development', type: 'Full-time', cap: 5 },
      { t: 'UX/UI Designer', cat: 'Design', type: 'Contract', cap: 1 },
      { t: 'Product Manager', cat: 'Management', type: 'Full-time', cap: 1 },
      { t: 'DevOps Engineer', cat: 'IT Support', type: 'Full-time', cap: 3 },
      { t: 'Data Scientist', cat: 'Software Development', type: 'Full-time', cap: 2 },
      { t: 'Marketing Specialist', cat: 'Management', type: 'Part-time', cap: 0 }, // No capacity
      { t: 'Machine Learning Engineer', cat: 'Software Development', type: 'Full-time', cap: 1 },
      { t: 'System Administrator', cat: 'IT Support', type: 'Full-time', cap: 1 },
      { t: 'Technical Writer', cat: 'Management', type: 'Contract', cap: 4 },
      { t: 'Full Stack Web Developer', cat: 'Software Development', type: 'Full-time', cap: 3 },
      { t: 'Mobile App Developer (iOS)', cat: 'Software Development', type: 'Full-time', cap: 2 },
      { t: 'Cybersecurity Analyst', cat: 'IT Support', type: 'Full-time', cap: 1 },
      { t: 'Cloud Architect', cat: 'Software Development', type: 'Full-time', cap: 1 },
      { t: 'Business Analyst', cat: 'Management', type: 'Full-time', cap: 2 },
    ];

    const jobs = [];
    for (let i = 0; i < jobData.length; i++) {
      const emp = employers[i % employers.length];

      // Let's make the 7th job Closed artificially based on capacity 0, or explicit isClosed
      const isClosed = jobData[i].cap === 0 || i === jobData.length - 1;

      const job = await Job.create({
        title: jobData[i].t,
        description: `Looking for an experienced ${jobData[i].t} to join ${emp.companyName}. You will work in a fast-paced environment!`,
        requirements: ['3+ years experience minimum', 'Strong communication skills', 'Ability to work independently'],
        location: emp.location,
        category: jobData[i].cat,
        type: jobData[i].type,
        salaryMin: 70000 + (Math.floor(Math.random() * 50000)),
        salaryMax: 130000 + (Math.floor(Math.random() * 50000)),
        company: emp._id,
        capacity: jobData[i].cap,
        deadline: new Date(Date.now() + 86400000 * Math.floor(Math.random() * 30 + 5)), // 5 to 35 days in future
        isClosed: isClosed
      });
      jobs.push(job);
    }

    // 5. Create Applications
    console.log('Creating Applications...');
    // We will distribute applications. As we apply, we decrement capacity if it's > 0
    for (let j of jobs) {
      if (j.isClosed) continue;

      // pick 2 random job seekers to apply to this job
      let applicants = seekers.slice().sort(() => 0.5 - Math.random()).slice(0, 2);

      for (let seeker of applicants) {
        if (j.capacity > 0) {
          await Application.create({
            applicant: seeker._id,
            job: j._id,
            status: Math.random() > 0.5 ? 'Interview' : 'Applied'
          });
          j.capacity -= 1;
          if (j.capacity === 0) {
            j.isClosed = true;
          }
          await j.save();
        }
      }
    }

    // 6. Create Events
    console.log('Creating Events...');
    const events = [
      {
        title: 'Global Tech Summit 2026',
        description: 'Join thousands of developers worldwide for the biggest virtual summit of the year.',
        date: new Date(Date.now() + 86400000 * 10), // 10 days
        location: 'Virtual',
        organizer: 'Tech Connect',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'AI & Cloud Mastery',
        description: 'Learn the latest in GenAI and AWS from industry veterans.',
        date: new Date(Date.now() + 86400000 * 20),
        location: 'San Francisco, CA',
        organizer: 'CloudNative Group',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60'
      }
    ];

    for (const evt of events) {
      await Event.create(evt);
    }

    console.log('Data Seeding Completed Successfully! 🚀');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data', error);
    process.exit(1);
  }
};

seedData();
