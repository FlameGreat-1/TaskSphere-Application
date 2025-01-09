// Templates.js

import { v4 as uuidv4 } from 'uuid';

const existingTemplates = [
    {
      id: 1,
      name: "Corporate Project Management",
      icon: "briefcase",
      color: "#0056b3",
      categories: ["Work", "Project Management"],
      tasks: [
        { title: "Define project scope", priority: "High", dueDate: "+7d" },
        { title: "Create project timeline", priority: "High", dueDate: "+3d" },
        { title: "Assign team roles", priority: "Medium", dueDate: "+5d" },
        { title: "Set up project management software", priority: "Medium", dueDate: "+2d" },
        { title: "Schedule kick-off meeting", priority: "High", dueDate: "+1d" },
        { title: "Develop risk management plan", priority: "Medium", dueDate: "+10d" },
        { title: "Create budget proposal", priority: "High", dueDate: "+5d" },
        { title: "Establish communication protocols", priority: "Medium", dueDate: "+4d" },
        { title: "Set up progress tracking system", priority: "Low", dueDate: "+6d" },
        { title: "Plan for regular status updates", priority: "Low", dueDate: "+8d" }
      ]
    },
    {
      id: 2,
      name: "Personal Fitness Journey",
      icon: "dumbbell",
      color: "#28a745",
      categories: ["Health", "Personal"],
      tasks: [
        { title: "Set fitness goals", priority: "High", dueDate: "today" },
        { title: "Create workout schedule", priority: "High", dueDate: "+1d" },
        { title: "Plan healthy meal prep", priority: "Medium", dueDate: "+2d" },
        { title: "Buy workout gear", priority: "Low", dueDate: "+5d" },
        { title: "Find a workout buddy", priority: "Low", dueDate: "+7d" },
        { title: "Schedule medical check-up", priority: "Medium", dueDate: "+14d" },
        { title: "Research supplements", priority: "Low", dueDate: "+10d" },
        { title: "Set up fitness tracking app", priority: "Medium", dueDate: "+3d" },
        { title: "Plan rest and recovery days", priority: "Medium", dueDate: "+4d" },
        { title: "Join online fitness community", priority: "Low", dueDate: "+6d" }
      ]
    },
    {
      id: 3,
      name: "Home Renovation",
      icon: "home",
      color: "#ffc107",
      categories: ["Home", "Project Management"],
      tasks: [
        { title: "Create renovation budget", priority: "High", dueDate: "+3d" },
        { title: "Research contractors", priority: "High", dueDate: "+7d" },
        { title: "Get multiple quotes", priority: "Medium", dueDate: "+14d" },
        { title: "Create project timeline", priority: "High", dueDate: "+5d" },
        { title: "Apply for necessary permits", priority: "High", dueDate: "+10d" },
        { title: "Choose materials and finishes", priority: "Medium", dueDate: "+21d" },
        { title: "Plan for temporary living arrangements", priority: "Medium", dueDate: "+30d" },
        { title: "Schedule utility shut-offs", priority: "Low", dueDate: "+45d" },
        { title: "Arrange for waste removal", priority: "Low", dueDate: "+40d" },
        { title: "Plan post-renovation cleaning", priority: "Low", dueDate: "+60d" }
      ]
    },
    {
      id: 4,
      name: "Wedding Planning",
      icon: "ring",
      color: "#e83e8c",
      categories: ["Personal", "Event Planning"],
      tasks: [
        { title: "Set wedding date", priority: "High", dueDate: "today" },
        { title: "Determine budget", priority: "High", dueDate: "+7d" },
        { title: "Create guest list", priority: "High", dueDate: "+14d" },
        { title: "Book venue", priority: "High", dueDate: "+30d" },
        { title: "Hire wedding planner", priority: "Medium", dueDate: "+21d" },
        { title: "Choose wedding party", priority: "Medium", dueDate: "+45d" },
        { title: "Start dress shopping", priority: "Medium", dueDate: "+60d" },
        { title: "Book photographer and videographer", priority: "Medium", dueDate: "+90d" },
        { title: "Plan honeymoon", priority: "Low", dueDate: "+120d" },
        { title: "Order invitations", priority: "Low", dueDate: "+150d" }
      ]
    },
    {
      id: 5,
      name: "Startup Launch",
      icon: "rocket",
      color: "#17a2b8",
      categories: ["Work", "Business"],
      tasks: [
        { title: "Finalize business plan", priority: "High", dueDate: "+14d" },
        { title: "Secure funding", priority: "High", dueDate: "+30d" },
        { title: "Register business", priority: "High", dueDate: "+7d" },
        { title: "Develop MVP", priority: "High", dueDate: "+60d" },
        { title: "Create marketing strategy", priority: "Medium", dueDate: "+45d" },
        { title: "Build website", priority: "Medium", dueDate: "+30d" },
        { title: "Hire initial team", priority: "Medium", dueDate: "+90d" },
        { title: "Set up accounting system", priority: "Low", dueDate: "+21d" },
        { title: "Plan launch event", priority: "Low", dueDate: "+100d" },
        { title: "Establish partnerships", priority: "Medium", dueDate: "+120d" }
      ]
    },
    {
      id: 6,
      name: "Academic Research Project",
      icon: "book",
      color: "#6f42c1",
      categories: ["Education", "Research"],
      tasks: [
        { title: "Define research question", priority: "High", dueDate: "+7d" },
        { title: "Conduct literature review", priority: "High", dueDate: "+30d" },
        { title: "Develop methodology", priority: "High", dueDate: "+14d" },
        { title: "Submit research proposal", priority: "High", dueDate: "+45d" },
        { title: "Obtain ethics approval", priority: "Medium", dueDate: "+60d" },
        { title: "Collect data", priority: "High", dueDate: "+120d" },
        { title: "Analyze results", priority: "High", dueDate: "+150d" },
        { title: "Write first draft", priority: "Medium", dueDate: "+180d" },
        { title: "Revise and edit", priority: "Medium", dueDate: "+210d" },
        { title: "Submit final paper", priority: "High", dueDate: "+240d" }
      ]
    },
    {
      id: 7,
      name: "Product Launch",
      icon: "box",
      color: "#fd7e14",
      categories: ["Work", "Marketing"],
      tasks: [
        { title: "Finalize product features", priority: "High", dueDate: "+30d" },
        { title: "Conduct market research", priority: "High", dueDate: "+45d" },
        { title: "Develop pricing strategy", priority: "High", dueDate: "+60d" },
        { title: "Create marketing materials", priority: "Medium", dueDate: "+75d" },
        { title: "Plan launch event", priority: "Medium", dueDate: "+90d" },
        { title: "Set up sales channels", priority: "High", dueDate: "+100d" },
        { title: "Train sales team", priority: "Medium", dueDate: "+110d" },
        { title: "Prepare press releases", priority: "Low", dueDate: "+120d" },
        { title: "Set up customer support", priority: "Medium", dueDate: "+130d" },
        { title: "Launch product", priority: "High", dueDate: "+150d" }
      ]
    },
    {
      id: 8,
      name: "Vacation Planning",
      icon: "plane",
      color: "#20c997",
      categories: ["Personal", "Travel"],
      tasks: [
        { title: "Choose destination", priority: "High", dueDate: "+7d" },
        { title: "Set budget", priority: "High", dueDate: "+14d" },
        { title: "Book flights", priority: "High", dueDate: "+30d" },
        { title: "Reserve accommodations", priority: "High", dueDate: "+35d" },
        { title: "Research activities and attractions", priority: "Medium", dueDate: "+45d" },
        { title: "Obtain necessary travel documents", priority: "High", dueDate: "+60d" },
        { title: "Arrange transportation at destination", priority: "Medium", dueDate: "+75d" },
        { title: "Purchase travel insurance", priority: "Low", dueDate: "+80d" },
        { title: "Create packing list", priority: "Low", dueDate: "+90d" },
        { title: "Notify bank and phone company", priority: "Medium", dueDate: "+95d" }
      ]
    },
    {
      id: 9,
      name: "Non-Profit Fundraising Campaign",
      icon: "hand-holding-heart",
      color: "#dc3545",
      categories: ["Non-Profit", "Fundraising"],
      tasks: [
        { title: "Define campaign goals", priority: "High", dueDate: "+7d" },
        { title: "Identify target donors", priority: "High", dueDate: "+14d" },
        { title: "Develop campaign message", priority: "High", dueDate: "+21d" },
        { title: "Create marketing materials", priority: "Medium", dueDate: "+35d" },
        { title: "Set up online donation platform", priority: "High", dueDate: "+28d" },
        { title: "Plan fundraising events", priority: "Medium", dueDate: "+45d" },
        { title: "Recruit volunteers", priority: "Medium", dueDate: "+50d" },
        { title: "Launch social media campaign", priority: "Medium", dueDate: "+60d" },
        { title: "Send out donor communications", priority: "High", dueDate: "+65d" },
        { title: "Track and report results", priority: "Low", dueDate: "+90d" }
      ]
    },
    {
      id: 10,
      name: "Mobile App Development",
      icon: "mobile-alt",
      color: "#6610f2",
      categories: ["Technology", "Development"],
      tasks: [
        { title: "Define app requirements", priority: "High", dueDate: "+7d" },
        { title: "Create wireframes", priority: "High", dueDate: "+14d" },
        { title: "Design user interface", priority: "High", dueDate: "+30d" },
        { title: "Develop backend architecture", priority: "High", dueDate: "+45d" },
        { title: "Implement core features", priority: "High", dueDate: "+75d" },
        { title: "Integrate third-party APIs", priority: "Medium", dueDate: "+90d" },
        { title: "Conduct user testing", priority: "Medium", dueDate: "+105d" },
        { title: "Optimize performance", priority: "Medium", dueDate: "+120d" },
        { title: "Prepare app store listing", priority: "Low", dueDate: "+130d" },
        { title: "Submit for app store approval", priority: "High", dueDate: "+140d" }
      ]
    },
    {
      id: 11,
      name: "Personal Finance Overhaul",
      icon: "chart-line",
      color: "#28a745",
      categories: ["Personal", "Finance"],
      tasks: [
        { title: "Assess current financial situation", priority: "High", dueDate: "+3d" },
        { title: "Set financial goals", priority: "High", dueDate: "+7d" },
        { title: "Create a budget", priority: "High", dueDate: "+14d" },
        { title: "Review and optimize expenses", priority: "Medium", dueDate: "+21d" },
        { title: "Set up emergency fund", priority: "High", dueDate: "+30d" },
        { title: "Review insurance coverage", priority: "Medium", dueDate: "+45d" },
        { title: "Develop investment strategy", priority: "Medium", dueDate: "+60d" },
        { title: "Plan for retirement savings", priority: "Medium", dueDate: "+75d" },
        { title: "Consolidate and manage debt", priority: "High", dueDate: "+90d" },
        { title: "Schedule regular financial check-ups", priority: "Low", dueDate: "+120d" }
      ]
    },

  {
    id: 12,
    name: "Restaurant Opening",
    icon: "utensils",
    color: "#ff6b6b",
    categories: ["Business", "Food & Beverage"],
    tasks: [
      { title: "Develop restaurant concept", priority: "High", dueDate: "+30d" },
      { title: "Secure location", priority: "High", dueDate: "+60d" },
      { title: "Obtain necessary licenses", priority: "High", dueDate: "+90d" },
      { title: "Design restaurant layout", priority: "Medium", dueDate: "+75d" },
      { title: "Create menu", priority: "High", dueDate: "+100d" },
      { title: "Hire and train staff", priority: "High", dueDate: "+120d" },
      { title: "Set up supplier relationships", priority: "Medium", dueDate: "+110d" },
      { title: "Develop marketing strategy", priority: "Medium", dueDate: "+130d" },
      { title: "Plan soft opening", priority: "Low", dueDate: "+150d" },
      { title: "Schedule grand opening", priority: "High", dueDate: "+180d" }
    ]
  },
  {
    id: 13,
    name: "Music Album Production",
    icon: "music",
    color: "#4b7bec",
    categories: ["Arts", "Music"],
    tasks: [
      { title: "Write songs", priority: "High", dueDate: "+60d" },
      { title: "Arrange music", priority: "High", dueDate: "+90d" },
      { title: "Book studio time", priority: "Medium", dueDate: "+100d" },
      { title: "Record tracks", priority: "High", dueDate: "+150d" },
      { title: "Mix and master album", priority: "High", dueDate: "+180d" },
      { title: "Design album artwork", priority: "Medium", dueDate: "+200d" },
      { title: "Plan album release strategy", priority: "Medium", dueDate: "+210d" },
      { title: "Organize promotional events", priority: "Low", dueDate: "+240d" },
      { title: "Submit to streaming platforms", priority: "High", dueDate: "+250d" },
      { title: "Plan album tour", priority: "Low", dueDate: "+270d" }
    ]
  },
  {
    id: 14,
    name: "Gardening Project",
    icon: "seedling",
    color: "#26de81",
    categories: ["Home", "Hobby"],
    tasks: [
      { title: "Plan garden layout", priority: "High", dueDate: "+7d" },
      { title: "Prepare soil", priority: "High", dueDate: "+14d" },
      { title: "Choose plants", priority: "Medium", dueDate: "+21d" },
      { title: "Purchase seeds and tools", priority: "Medium", dueDate: "+28d" },
      { title: "Plant seeds/seedlings", priority: "High", dueDate: "+35d" },
      { title: "Set up irrigation system", priority: "Medium", dueDate: "+42d" },
      { title: "Create compost bin", priority: "Low", dueDate: "+49d" },
      { title: "Install garden features", priority: "Low", dueDate: "+56d" },
      { title: "Develop maintenance schedule", priority: "Medium", dueDate: "+63d" },
      { title: "Plan for seasonal changes", priority: "Low", dueDate: "+70d" }
    ]
  },
  {
    id: 15,
    name: "Cybersecurity Audit",
    icon: "shield-alt",
    color: "#45aaf2",
    categories: ["Technology", "Security"],
    tasks: [
      { title: "Define audit scope", priority: "High", dueDate: "+7d" },
      { title: "Inventory IT assets", priority: "High", dueDate: "+14d" },
      { title: "Review security policies", priority: "Medium", dueDate: "+21d" },
      { title: "Conduct vulnerability scans", priority: "High", dueDate: "+28d" },
      { title: "Perform penetration testing", priority: "High", dueDate: "+35d" },
      { title: "Analyze access controls", priority: "Medium", dueDate: "+42d" },
      { title: "Evaluate incident response plan", priority: "Medium", dueDate: "+49d" },
      { title: "Assess data encryption", priority: "High", dueDate: "+56d" },
      { title: "Review network security", priority: "High", dueDate: "+63d" },
      { title: "Prepare audit report", priority: "High", dueDate: "+70d" }
    ]
  },
  {
    id: 16,
    name: "Fitness Competition Prep",
    icon: "trophy",
    color: "#fed330",
    categories: ["Health", "Sports"],
    tasks: [
      { title: "Choose competition", priority: "High", dueDate: "+7d" },
      { title: "Design training program", priority: "High", dueDate: "+14d" },
      { title: "Create nutrition plan", priority: "High", dueDate: "+21d" },
      { title: "Schedule regular check-ins", priority: "Medium", dueDate: "+28d" },
      { title: "Book competition travel", priority: "Low", dueDate: "+60d" },
      { title: "Purchase competition attire", priority: "Medium", dueDate: "+90d" },
      { title: "Practice posing routines", priority: "Medium", dueDate: "+100d" },
      { title: "Arrange for coaching", priority: "High", dueDate: "+30d" },
      { title: "Plan peak week strategy", priority: "High", dueDate: "+120d" },
      { title: "Prepare mentally", priority: "High", dueDate: "+150d" }
    ]
  },
  {
    id: 17,
    name: "Sustainable Living Challenge",
    icon: "leaf",
    color: "#2ecc71",
    categories: ["Lifestyle", "Environment"],
    tasks: [
      { title: "Conduct personal carbon footprint audit", priority: "High", dueDate: "+7d" },
      { title: "Switch to renewable energy provider", priority: "Medium", dueDate: "+30d" },
      { title: "Start composting", priority: "Low", dueDate: "+14d" },
      { title: "Implement water-saving measures", priority: "Medium", dueDate: "+21d" },
      { title: "Reduce single-use plastics", priority: "High", dueDate: "+1d" },
      { title: "Plan a vegetable garden", priority: "Low", dueDate: "+60d" },
      { title: "Research and switch to eco-friendly products", priority: "Medium", dueDate: "+45d" },
      { title: "Organize a community clean-up event", priority: "Low", dueDate: "+90d" },
      { title: "Learn about and support local environmental initiatives", priority: "Medium", dueDate: "+30d" },
      { title: "Calculate and offset travel emissions", priority: "Low", dueDate: "+120d" }
    ]
  },
  {
    id: 18,
    name: "Podcast Launch",
    icon: "microphone",
    color: "#e74c3c",
    categories: ["Media", "Business"],
    tasks: [
      { title: "Define podcast concept and audience", priority: "High", dueDate: "+7d" },
      { title: "Choose podcast name and create artwork", priority: "High", dueDate: "+14d" },
      { title: "Set up recording equipment", priority: "High", dueDate: "+21d" },
      { title: "Plan first 10 episode topics", priority: "Medium", dueDate: "+28d" },
      { title: "Record intro and outro", priority: "Medium", dueDate: "+35d" },
      { title: "Set up podcast hosting platform", priority: "High", dueDate: "+42d" },
      { title: "Submit podcast to directories", priority: "High", dueDate: "+49d" },
      { title: "Create social media accounts", priority: "Low", dueDate: "+56d" },
      { title: "Record and edit first episode", priority: "High", dueDate: "+63d" },
      { title: "Plan launch promotion strategy", priority: "Medium", dueDate: "+70d" }
    ]
  },
  {
    id: 19,
    name: "Artificial Intelligence Research Project",
    icon: "robot",
    color: "#3498db",
    categories: ["Technology", "Research"],
    tasks: [
      { title: "Define research question", priority: "High", dueDate: "+7d" },
      { title: "Conduct literature review", priority: "High", dueDate: "+30d" },
      { title: "Design AI model architecture", priority: "High", dueDate: "+60d" },
      { title: "Collect and preprocess data", priority: "Medium", dueDate: "+90d" },
      { title: "Implement AI algorithm", priority: "High", dueDate: "+120d" },
      { title: "Train and validate model", priority: "High", dueDate: "+150d" },
      { title: "Analyze results", priority: "Medium", dueDate: "+180d" },
      { title: "Write research paper", priority: "Medium", dueDate: "+210d" },
      { title: "Prepare for conference presentation", priority: "Low", dueDate: "+240d" },
      { title: "Explore potential applications", priority: "Low", dueDate: "+270d" }
    ]
  },
  {
    id: 20,
    name: "Eco-Friendly Home Makeover",
    icon: "recycle",
    color: "#27ae60",
    categories: ["Home", "Environment"],
    tasks: [
      { title: "Conduct energy audit", priority: "High", dueDate: "+7d" },
      { title: "Install smart thermostat", priority: "Medium", dueDate: "+14d" },
      { title: "Replace old appliances with energy-efficient models", priority: "High", dueDate: "+30d" },
      { title: "Install solar panels", priority: "Medium", dueDate: "+60d" },
      { title: "Set up rainwater collection system", priority: "Low", dueDate: "+90d" },
      { title: "Replace traditional bulbs with LEDs", priority: "High", dueDate: "+7d" },
      { title: "Improve home insulation", priority: "Medium", dueDate: "+45d" },
      { title: "Create compost system", priority: "Low", dueDate: "+21d" },
      { title: "Install low-flow water fixtures", priority: "Medium", dueDate: "+30d" },
      { title: "Set up home recycling station", priority: "High", dueDate: "+14d" }
    ]
  },
  {
    id: 21,
    name: "Language Learning Challenge",
    icon: "language",
    color: "#9b59b6",
    categories: ["Education", "Personal Development"],
    tasks: [
      { title: "Choose target language", priority: "High", dueDate: "+1d" },
      { title: "Set SMART language goals", priority: "High", dueDate: "+3d" },
      { title: "Find language learning resources", priority: "Medium", dueDate: "+7d" },
      { title: "Create study schedule", priority: "High", dueDate: "+10d" },
      { title: "Learn basic greetings and phrases", priority: "High", dueDate: "+14d" },
      { title: "Start using language learning app daily", priority: "Medium", dueDate: "+7d" },
      { title: "Find language exchange partner", priority: "Low", dueDate: "+30d" },
      { title: "Immerse in target language media", priority: "Medium", dueDate: "+21d" },
      { title: "Take online placement test", priority: "Low", dueDate: "+60d" },
      { title: "Plan trip to country of target language", priority: "Low", dueDate: "+90d" }
    ]
  },
  {
    id: 22,
    name: "Freelance Business Setup",
    icon: "briefcase",
    color: "#f39c12",
    categories: ["Business", "Career"],
    tasks: [
      { title: "Define your services", priority: "High", dueDate: "+7d" },
      { title: "Create a business plan", priority: "High", dueDate: "+14d" },
      { title: "Set up business structure", priority: "High", dueDate: "+21d" },
      { title: "Register your business", priority: "High", dueDate: "+28d" },
      { title: "Set up business banking", priority: "Medium", dueDate: "+35d" },
      { title: "Create portfolio website", priority: "Medium", dueDate: "+42d" },
      { title: "Set up accounting system", priority: "Medium", dueDate: "+49d" },
      { title: "Develop pricing strategy", priority: "High", dueDate: "+56d" },
      { title: "Create contract template", priority: "Medium", dueDate: "+63d" },
      { title: "Network and find first client", priority: "High", dueDate: "+70d" }
    ]
  },
  {
    id: 520,
    name: "Virtual Reality Game Development",
    icon: "vr-cardboard",
    color: "#8e44ad",
    categories: ["Technology", "Gaming"],
    tasks: [
      { title: "Brainstorm game concept", priority: "High", dueDate: "+7d" },
      { title: "Create game design document", priority: "High", dueDate: "+21d" },
      { title: "Set up VR development environment", priority: "High", dueDate: "+14d" },
      { title: "Design basic game mechanics", priority: "Medium", dueDate: "+35d" },
      { title: "Develop prototype level", priority: "High", dueDate: "+60d" },
      { title: "Implement VR interactions", priority: "High", dueDate: "+90d" },
      { title: "Create 3D assets", priority: "Medium", dueDate: "+120d" },
      { title: "Implement sound design", priority: "Low", dueDate: "+150d" },
      { title: "Conduct user testing", priority: "Medium", dueDate: "+180d" },
      { title: "Optimize performance for VR", priority: "High", dueDate: "+210d" }
    ]
  },
  {
    id: 23,
    name: "Space Exploration Mission Planning",
    icon: "rocket",
    color: "#34495e",
    categories: ["Science", "Aerospace"],
    tasks: [
      { title: "Define mission objectives", priority: "High", dueDate: "+30d" },
      { title: "Design spacecraft", priority: "High", dueDate: "+180d" },
      { title: "Develop life support systems", priority: "High", dueDate: "+240d" },
      { title: "Plan trajectory and orbital maneuvers", priority: "Medium", dueDate: "+120d" },
      { title: "Conduct astronaut training", priority: "High", dueDate: "+365d" },
      { title: "Prepare launch facilities", priority: "Medium", dueDate: "+300d" },
      { title: "Establish mission control protocols", priority: "Medium", dueDate: "+270d" },
      { title: "Secure international partnerships", priority: "Low", dueDate: "+180d" },
      { title: "Develop contingency plans", priority: "High", dueDate: "+330d" },
      { title: "Plan post-mission analysis", priority: "Low", dueDate: "+400d" }
    ]
  },
  {
    id: 24,
    name: "Sustainable Fashion Line Launch",
    icon: "tshirt",
    color: "#16a085",
    categories: ["Fashion", "Sustainability"],
    tasks: [
      { title: "Research eco-friendly materials", priority: "High", dueDate: "+30d" },
      { title: "Design initial collection", priority: "High", dueDate: "+60d" },
      { title: "Source sustainable suppliers", priority: "High", dueDate: "+45d" },
      { title: "Develop pricing strategy", priority: "Medium", dueDate: "+75d" },
      { title: "Create marketing plan", priority: "Medium", dueDate: "+90d" },
      { title: "Set up e-commerce platform", priority: "High", dueDate: "+100d" },
      { title: "Plan photoshoot", priority: "Low", dueDate: "+110d" },
      { title: "Establish partnerships with influencers", priority: "Low", dueDate: "+120d" },
      { title: "Organize launch event", priority: "Medium", dueDate: "+150d" },
      { title: "Implement recycling program", priority: "Low", dueDate: "+180d" }
    ]
  },
  {
    id: 25,
    name: "Blockchain-based Voting System",
    icon: "vote-yea",
    color: "#2980b9",
    categories: ["Technology", "Government"],
    tasks: [
      { title: "Define system requirements", priority: "High", dueDate: "+15d" },
      { title: "Design blockchain architecture", priority: "High", dueDate: "+45d" },
      { title: "Develop smart contracts", priority: "High", dueDate: "+75d" },
      { title: "Implement user authentication", priority: "High", dueDate: "+90d" },
      { title: "Create user interface", priority: "Medium", dueDate: "+120d" },
      { title: "Conduct security audits", priority: "High", dueDate: "+150d" },
      { title: "Perform scalability testing", priority: "Medium", dueDate: "+180d" },
      { title: "Develop voter education materials", priority: "Low", dueDate: "+200d" },
      { title: "Obtain regulatory approvals", priority: "High", dueDate: "+240d" },
      { title: "Plan pilot implementation", priority: "Medium", dueDate: "+270d" }
    ]
  },
  {
    id: 26,
    name: "Quantum Computing Research Project",
    icon: "atom",
    color: "#8e44ad",
    categories: ["Technology", "Research"],
    tasks: [
      { title: "Define research objectives", priority: "High", dueDate: "+30d" },
      { title: "Review current quantum computing literature", priority: "High", dueDate: "+60d" },
      { title: "Design quantum algorithms", priority: "High", dueDate: "+120d" },
      { title: "Simulate quantum circuits", priority: "Medium", dueDate: "+180d" },
      { title: "Collaborate with hardware teams", priority: "Medium", dueDate: "+210d" },
      { title: "Analyze results and optimize algorithms", priority: "High", dueDate: "+270d" },
      { title: "Prepare research paper", priority: "Medium", dueDate: "+300d" },
      { title: "Present findings at conferences", priority: "Low", dueDate: "+330d" },
      { title: "Explore practical applications", priority: "Medium", dueDate: "+360d" },
      { title: "Secure funding for extended research", priority: "High", dueDate: "+390d" }
    ]
  },

  {
    id: 26,
    name: "Space Exploration Mission",
    icon: "rocket",
    color: "#8E44AD",
    categories: ["Science", "Aerospace"],
    tasks: [
      { title: "Define mission objectives", priority: "High", dueDate: "+30d" },
      { title: "Design spacecraft", priority: "High", dueDate: "+90d" },
      { title: "Develop life support systems", priority: "High", dueDate: "+120d" },
      { title: "Plan trajectory", priority: "Medium", dueDate: "+60d" },
      { title: "Train astronaut crew", priority: "High", dueDate: "+180d" },
      { title: "Conduct system simulations", priority: "Medium", dueDate: "+150d" },
      { title: "Prepare launch site", priority: "Medium", dueDate: "+210d" },
      { title: "Coordinate with international partners", priority: "Low", dueDate: "+45d" },
      { title: "Develop communication protocols", priority: "Medium", dueDate: "+75d" },
      { title: "Plan post-mission analysis", priority: "Low", dueDate: "+240d" }
    ]
  },
  {
    id: 28,
    name: "Sustainable Fashion Line Launch",
    icon: "tshirt",
    color: "#27AE60",
    categories: ["Fashion", "Sustainability"],
    tasks: [
      { title: "Research eco-friendly materials", priority: "High", dueDate: "+30d" },
      { title: "Design initial collection", priority: "High", dueDate: "+60d" },
      { title: "Source sustainable suppliers", priority: "High", dueDate: "+45d" },
      { title: "Develop pricing strategy", priority: "Medium", dueDate: "+75d" },
      { title: "Create marketing campaign", priority: "Medium", dueDate: "+90d" },
      { title: "Set up e-commerce platform", priority: "High", dueDate: "+100d" },
      { title: "Plan photoshoot", priority: "Low", dueDate: "+110d" },
      { title: "Establish partnerships with influencers", priority: "Medium", dueDate: "+120d" },
      { title: "Organize launch event", priority: "Medium", dueDate: "+150d" },
      { title: "Set up recycling program", priority: "Low", dueDate: "+180d" }
    ]
  },
  {
    id: 29,
    name: "Virtual Reality Game Development",
    icon: "vr-cardboard",
    color: "#3498DB",
    categories: ["Technology", "Gaming"],
    tasks: [
      { title: "Conceptualize game idea", priority: "High", dueDate: "+14d" },
      { title: "Design game mechanics", priority: "High", dueDate: "+30d" },
      { title: "Create 3D assets", priority: "High", dueDate: "+60d" },
      { title: "Develop VR interactions", priority: "High", dueDate: "+90d" },
      { title: "Implement sound design", priority: "Medium", dueDate: "+75d" },
      { title: "Optimize performance", priority: "Medium", dueDate: "+120d" },
      { title: "Conduct user testing", priority: "High", dueDate: "+150d" },
      { title: "Debug and refine", priority: "High", dueDate: "+180d" },
      { title: "Prepare for app store submission", priority: "Medium", dueDate: "+200d" },
      { title: "Plan post-launch support", priority: "Low", dueDate: "+210d" }
    ]
  },
  {
    id: 30,
    name: "Urban Vertical Farm Setup",
    icon: "seedling",
    color: "#2ECC71",
    categories: ["Agriculture", "Sustainability"],
    tasks: [
      { title: "Secure location", priority: "High", dueDate: "+30d" },
      { title: "Design vertical farming system", priority: "High", dueDate: "+60d" },
      { title: "Source equipment and seeds", priority: "High", dueDate: "+45d" },
      { title: "Set up hydroponics", priority: "High", dueDate: "+75d" },
      { title: "Install lighting systems", priority: "Medium", dueDate: "+90d" },
      { title: "Implement climate control", priority: "High", dueDate: "+100d" },
      { title: "Develop nutrient management plan", priority: "Medium", dueDate: "+110d" },
      { title: "Train staff", priority: "Medium", dueDate: "+120d" },
      { title: "Establish distribution partnerships", priority: "Low", dueDate: "+150d" },
      { title: "Plan for waste management", priority: "Low", dueDate: "+160d" }
    ]
  },
  {
    id: 31,
    name: "Blockchain-based Supply Chain",
    icon: "link",
    color: "#F39C12",
    categories: ["Technology", "Logistics"],
    tasks: [
      { title: "Define supply chain requirements", priority: "High", dueDate: "+14d" },
      { title: "Choose blockchain platform", priority: "High", dueDate: "+30d" },
      { title: "Design smart contracts", priority: "High", dueDate: "+60d" },
      { title: "Develop tracking system", priority: "High", dueDate: "+90d" },
      { title: "Integrate with existing systems", priority: "Medium", dueDate: "+120d" },
      { title: "Implement security measures", priority: "High", dueDate: "+100d" },
      { title: "Conduct stakeholder training", priority: "Medium", dueDate: "+150d" },
      { title: "Perform system testing", priority: "High", dueDate: "+180d" },
      { title: "Plan for scalability", priority: "Low", dueDate: "+200d" },
      { title: "Prepare for go-live", priority: "High", dueDate: "+210d" }
    ]
  },
  {
    id: 32,
    name: "Mindfulness Meditation App",
    icon: "om",
    color: "#9B59B6",
    categories: ["Health", "Technology"],
    tasks: [
      { title: "Research meditation techniques", priority: "High", dueDate: "+14d" },
      { title: "Design user interface", priority: "High", dueDate: "+30d" },
      { title: "Develop meditation content", priority: "High", dueDate: "+60d" },
      { title: "Implement audio features", priority: "High", dueDate: "+45d" },
      { title: "Create user progress tracking", priority: "Medium", dueDate: "+75d" },
      { title: "Integrate social sharing", priority: "Low", dueDate: "+90d" },
      { title: "Develop offline mode", priority: "Medium", dueDate: "+100d" },
      { title: "Conduct beta testing", priority: "High", dueDate: "+120d" },
      { title: "Optimize app performance", priority: "Medium", dueDate: "+135d" },
      { title: "Plan marketing strategy", priority: "Medium", dueDate: "+150d" }
    ]
  },
  {
    id: 33,
    name: "Eco-friendly Tiny House Construction",
    icon: "home",
    color: "#D35400",
    categories: ["Construction", "Sustainability"],
    tasks: [
      { title: "Design tiny house plans", priority: "High", dueDate: "+30d" },
      { title: "Source sustainable materials", priority: "High", dueDate: "+45d" },
      { title: "Obtain necessary permits", priority: "High", dueDate: "+60d" },
      { title: "Prepare construction site", priority: "Medium", dueDate: "+75d" },
      { title: "Build foundation", priority: "High", dueDate: "+90d" },
      { title: "Construct frame and walls", priority: "High", dueDate: "+120d" },
      { title: "Install eco-friendly utilities", priority: "Medium", dueDate: "+150d" },
      { title: "Implement space-saving solutions", priority: "Medium", dueDate: "+165d" },
      { title: "Finish interior", priority: "High", dueDate: "+180d" },
      { title: "Conduct final inspections", priority: "High", dueDate: "+195d" }
    ]
  },
  {
    id: 34,
    name: "Artificial Intelligence Ethics Board",
    icon: "brain",
    color: "#34495E",
    categories: ["Technology", "Ethics"],
    tasks: [
      { title: "Define board objectives", priority: "High", dueDate: "+14d" },
      { title: "Recruit diverse board members", priority: "High", dueDate: "+45d" },
      { title: "Develop AI ethics framework", priority: "High", dueDate: "+75d" },
      { title: "Create review process", priority: "Medium", dueDate: "+90d" },
      { title: "Establish reporting mechanisms", priority: "Medium", dueDate: "+105d" },
      { title: "Plan regular ethics audits", priority: "High", dueDate: "+120d" },
      { title: "Develop public communication strategy", priority: "Low", dueDate: "+135d" },
      { title: "Set up collaboration with AI developers", priority: "Medium", dueDate: "+150d" },
      { title: "Create ethics training program", priority: "Medium", dueDate: "+180d" },
      { title: "Plan for ongoing policy updates", priority: "Low", dueDate: "+210d" }
    ]
  },
  {
    id: 35,
    name: "Zero-Waste Restaurant Launch",
    icon: "utensils",
    color: "#16A085",
    categories: ["Food & Beverage", "Sustainability"],
    tasks: [
      { title: "Develop zero-waste menu", priority: "High", dueDate: "+30d" },
      { title: "Source local, sustainable ingredients", priority: "High", dueDate: "+45d" },
      { title: "Design eco-friendly kitchen", priority: "High", dueDate: "+60d" },
      { title: "Implement composting system", priority: "Medium", dueDate: "+75d" },
      { title: "Create recycling program", priority: "Medium", dueDate: "+90d" },
      { title: "Train staff on zero-waste practices", priority: "High", dueDate: "+105d" },
      { title: "Develop partnerships with local farms", priority: "Medium", dueDate: "+120d" },
      { title: "Design sustainable packaging", priority: "Low", dueDate: "+135d" },
      { title: "Plan soft opening", priority: "High", dueDate: "+150d" },
      { title: "Create waste reduction tracking system", priority: "Low", dueDate: "+165d" }
    ]
  },
  {
    id: 36,
    name: "Augmented Reality Art Exhibition",
    icon: "palette",
    color: "#8E44AD",
    categories: ["Art", "Technology"],
    tasks: [
      { title: "Conceptualize AR art pieces", priority: "High", dueDate: "+30d" },
      { title: "Develop AR application", priority: "High", dueDate: "+60d" },
      { title: "Create digital assets", priority: "High", dueDate: "+90d" },
      { title: "Secure exhibition space", priority: "Medium", dueDate: "+45d" },
      { title: "Design physical installation elements", priority: "Medium", dueDate: "+75d" },
      { title: "Test AR experiences", priority: "High", dueDate: "+120d" },
      { title: "Develop visitor guide", priority: "Low", dueDate: "+135d" },
      { title: "Train exhibition staff", priority: "Medium", dueDate: "+150d" },
      { title: "Plan opening night event", priority: "Medium", dueDate: "+165d" },
      { title: "Create social media campaign", priority: "Low", dueDate: "+180d" }
    ]
  }
];

function generateRandomTemplates(startId, count) {
  const industries = [
    "Technology", "Healthcare", "Education", "Finance", "Entertainment", "Sports", "Travel", "Food", "Fashion", "Energy",
    "Agriculture", "Automotive", "Construction", "Retail", "Real Estate", "Telecommunications", "Manufacturing", "Aerospace",
    "Biotechnology", "Environmental", "Logistics", "Media", "Mining", "Pharmaceuticals", "Robotics", "Cybersecurity",
    "Artificial Intelligence", "Virtual Reality", "Blockchain", "Internet of Things", "Quantum Computing", "Nanotechnology",
    "Renewable Energy", "Space Exploration", "E-commerce", "Social Media", "Gaming", "Fitness", "Wellness", "Art",
    "Music", "Literature", "Film", "Photography", "Dance", "Theater", "Culinary Arts", "Architecture", "Interior Design",
    "Graphic Design", "Marketing", "Advertising", "Public Relations", "Human Resources", "Legal Services", "Consulting",
    "Non-profit", "Government", "Military", "Law Enforcement", "Emergency Services", "Hospitality", "Tourism",
    "Event Planning", "Wedding Industry", "Child Care", "Elder Care", "Pet Care", "Veterinary Services", "Dentistry",
    "Optometry", "Physiotherapy", "Psychiatry", "Nutrition", "Fitness Training", "Yoga", "Meditation", "Alternative Medicine",
    "Organic Farming", "Sustainable Living", "Recycling", "Waste Management", "Water Treatment", "Air Purification",
    "Solar Power", "Wind Energy", "Geothermal Energy", "Hydropower", "Nuclear Energy", "Oil and Gas", "Mining",
    "Forestry", "Fishing", "Aquaculture", "Horticulture", "Viticulture", "Brewing", "Distilling", "Coffee Industry",
    "Tea Industry", "Chocolate Industry", "Dairy Industry", "Meat Industry", "Vegetarian/Vegan Industry", "Fast Food",
    "Fine Dining", "Food Delivery", "Catering", "Baking", "Confectionery", "Ice Cream Industry", "Soft Drinks Industry"
  ];

  const activities = [
    "Launch", "Development", "Research", "Planning", "Implementation", "Optimization", "Expansion", "Renovation", "Analysis", "Training",
    "Marketing Campaign", "Rebranding", "Product Design", "Service Design", "Customer Support", "Quality Assurance", "Data Migration",
    "System Integration", "Network Setup", "Security Audit", "Compliance Check", "Performance Review", "Budget Planning", "Fundraising",
    "Recruitment", "Team Building", "Leadership Development", "Process Improvement", "Inventory Management", "Supply Chain Optimization",
    "Logistics Planning", "Distribution Strategy", "Retail Expansion", "E-commerce Integration", "Mobile App Development", "Website Redesign",
    "Social Media Strategy", "Content Creation", "SEO Optimization", "Email Marketing", "Influencer Collaboration", "Event Organization",
    "Trade Show Participation", "Product Launch", "Service Launch", "Merger", "Acquisition", "Partnership Formation", "Franchise Expansion",
    "International Expansion", "Market Research", "Competitive Analysis", "Customer Segmentation", "Pricing Strategy", "Sales Training",
    "Customer Retention Program", "Loyalty Program Development", "Crisis Management", "Public Relations Campaign", "Corporate Social Responsibility Initiative",
    "Sustainability Program", "Diversity and Inclusion Initiative", "Employee Wellness Program", "Remote Work Transition", "Office Relocation",
    "Facility Upgrade", "Equipment Procurement", "Software Implementation", "Hardware Upgrade", "Cloud Migration", "Data Center Setup",
    "Disaster Recovery Planning", "Business Continuity Planning", "Risk Assessment", "Insurance Review", "Legal Compliance Audit",
    "Intellectual Property Protection", "Contract Negotiation", "Vendor Management", "Outsourcing Strategy", "Insourcing Initiative",
    "Quality Management System Implementation", "ISO Certification", "Lean Six Sigma Project", "Agile Transformation", "DevOps Implementation",
    "Artificial Intelligence Integration", "Machine Learning Model Development", "Blockchain Implementation", "IoT Device Deployment",
    "5G Network Rollout", "Virtual Reality Experience Creation", "Augmented Reality App Development", "3D Printing Initiative",
    "Drone Program Implementation", "Robotics Process Automation", "Cybersecurity Enhancement", "Data Privacy Program", "Big Data Analytics Project",
    "Customer Experience Improvement", "User Interface Redesign", "Accessibility Improvement", "Localization and Translation", "Payment System Integration",
    "Subscription Model Implementation", "Freemium Model Launch", "Crowdfunding Campaign", "Initial Public Offering", "Private Equity Funding Round"
  ];

  const icons = [
    "rocket", "heartbeat", "graduation-cap", "chart-line", "film", "futbol", "plane", "utensils", "tshirt", "bolt",
    "laptop", "stethoscope", "book", "dollar-sign", "tv", "dumbbell", "suitcase", "hamburger", "palette", "lightbulb",
    "car", "building", "shopping-cart", "home", "mobile-alt", "cogs", "space-shuttle", "dna", "leaf", "truck",
    "newspaper", "mountain", "pills", "robot", "shield-alt", "brain", "vr-cardboard", "link", "microchip", "satellite",
    "store", "hashtag", "gamepad", "heart", "spa", "paint-brush", "music", "book-open", "video", "camera",
    "theater-masks", "couch", "pencil-ruler", "ad", "users", "gavel", "briefcase", "hands-helping", "landmark", "fighter-jet",
    "user-shield", "ambulance", "bed", "umbrella-beach", "calendar-check", "ring", "baby-carriage", "dog", "tooth",
    "eye", "walking", "brain", "apple-alt", "dumbbell", "yin-yang", "mortar-pestle", "seedling", "recycle", "trash",
    "tint", "fan", "solar-panel", "wind", "atom", "oil-can", "gem", "tree", "fish", "tractor",
    "wine-glass", "beer", "coffee", "mug-hot", "cheese", "egg", "bacon", "carrot", "pizza-slice", "ice-cream",
    "cookie", "candy-cane"
  ];

  const colors = [
    "#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#d35400", "#34495e", "#7f8c8d", "#2c3e50",
    "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f1c40f", "#e67e22", "#95a5a6", "#d35400", "#c0392b", "#bdc3c7",
    "#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#34495e", "#2c3e50", "#e74c3c", "#c0392b",
    "#ecf0f1", "#95a5a6", "#7f8c8d", "#bdc3c7", "#f39c12", "#f1c40f", "#d35400", "#e67e22", "#9b59b6", "#8e44ad"
  ];

  const priorities = ["High", "Medium", "Low"];

  function generateRandomTask(index) {
    const taskTypes = [
      "Plan", "Design", "Develop", "Implement", "Test", "Launch", "Review", "Optimize", "Analyze", "Report",
      "Research", "Prototype", "Validate", "Train", "Deploy", "Monitor", "Evaluate", "Refine", "Present", "Document",
      "Coordinate", "Negotiate", "Procure", "Install", "Configure", "Migrate", "Integrate", "Secure", "Audit", "Certify"
    ];
    
    const taskObjects = [
      "strategy", "system", "process", "team", "resources", "infrastructure", "platform", "framework", "methodology", "policy",
      "guidelines", "standards", "prototype", "model", "algorithm", "database", "network", "interface", "module", "component",
      "feature", "functionality", "service", "product", "campaign", "program", "initiative", "project", "partnership", "collaboration"
    ];

    const randomTaskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const randomTaskObject = taskObjects[Math.floor(Math.random() * taskObjects.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomDueDate = `+${Math.floor(Math.random() * 180) + 1}d`;

    return {
      title: `${randomTaskType} ${randomTaskObject}`,
      priority: randomPriority,
      dueDate: randomDueDate
    };
  }

  function generateUniqueColor(usedColors) {
    let color;
    do {
      color = colors[Math.floor(Math.random() * colors.length)];
    } while (usedColors.has(color));
    usedColors.add(color);
    return color;
  }

  const templates = [];
  const usedNames = new Set();
  const usedColors = new Set();

  for (let i = 0; i < count; i++) {
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    let name;
    do {
      name = `${industry} ${activity}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const template = {
      id: startId + i,
      uuid: uuidv4(),
      name: name,
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: generateUniqueColor(usedColors),
      categories: [industry, activity],
      tasks: Array.from({ length: 10 }, (_, index) => generateRandomTask(index))
    };

    templates.push(template);
  }

  return templates;
}

// Generate additional templates
const additionalTemplates = generateRandomTemplates(existingTemplates.length + 1, 100); // Generate 100 additional templates

// Combine existing and additional templates
const allTemplates = [...existingTemplates, ...additionalTemplates];

const chunkSize = 10;

export const getTemplates = (start = 0, count = chunkSize) => {
    return allTemplates.slice(start, start + count);
};

export const totalTemplateCount = () => allTemplates.length;

export const addTemplate = (template) => {
    const newTemplate = {
        id: uuidv4(),
        ...template
    };
    allTemplates.push(newTemplate);
    return newTemplate;
};

export const getTemplateById = (id) => {
    return allTemplates.find(template => template.id === id);
};


