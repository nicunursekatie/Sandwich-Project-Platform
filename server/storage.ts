import { 
  users, projects, messages, weeklyReports, meetingMinutes, driveLinks, sandwichCollections,
  type User, type InsertUser, 
  type Project, type InsertProject,
  type Message, type InsertMessage,
  type WeeklyReport, type InsertWeeklyReport,
  type SandwichCollection, type InsertSandwichCollection,
  type MeetingMinutes, type InsertMeetingMinutes,
  type DriveLink, type InsertDriveLink
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Messages
  getAllMessages(): Promise<Message[]>;
  getRecentMessages(limit: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Weekly Reports
  getAllWeeklyReports(): Promise<WeeklyReport[]>;
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  
  // Sandwich Collections
  getAllSandwichCollections(): Promise<SandwichCollection[]>;
  createSandwichCollection(collection: InsertSandwichCollection): Promise<SandwichCollection>;
  
  // Meeting Minutes
  getAllMeetingMinutes(): Promise<MeetingMinutes[]>;
  getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]>;
  createMeetingMinutes(minutes: InsertMeetingMinutes): Promise<MeetingMinutes>;
  
  // Drive Links
  getAllDriveLinks(): Promise<DriveLink[]>;
  createDriveLink(link: InsertDriveLink): Promise<DriveLink>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private messages: Map<number, Message>;
  private weeklyReports: Map<number, WeeklyReport>;
  private sandwichCollections: Map<number, SandwichCollection>;
  private meetingMinutes: Map<number, MeetingMinutes>;
  private driveLinks: Map<number, DriveLink>;
  private currentIds: {
    user: number;
    project: number;
    message: number;
    weeklyReport: number;
    sandwichCollection: number;
    meetingMinutes: number;
    driveLink: number;
  };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.messages = new Map();
    this.weeklyReports = new Map();
    this.sandwichCollections = new Map();
    this.meetingMinutes = new Map();
    this.driveLinks = new Map();
    this.currentIds = {
      user: 1,
      project: 1,
      message: 1,
      weeklyReport: 1,
      sandwichCollection: 1,
      meetingMinutes: 1,
      driveLink: 1,
    };
    
    this.seedData();
  }

  private seedData() {
    // Seed users
    this.createUser({ username: "john", name: "John Doe" });
    
    // Seed projects
    this.createProject({
      title: "Downtown Location Setup",
      description: "Initial setup and equipment installation",
      status: "available",
      assigneeId: null,
      assigneeName: null,
      color: "green"
    });
    
    this.createProject({
      title: "Menu Development",
      description: "Create seasonal sandwich menu",
      status: "in_progress",
      assigneeId: null,
      assigneeName: "Sarah",
      color: "amber"
    });
    
    this.createProject({
      title: "Staff Training Program",
      description: "Comprehensive training for new hires",
      status: "planning",
      assigneeId: null,
      assigneeName: null,
      color: "blue"
    });
    
    this.createProject({
      title: "Marketing Campaign",
      description: "Social media and local advertising",
      status: "available",
      assigneeId: null,
      assigneeName: null,
      color: "purple"
    });
    
    // Seed messages
    this.createMessage({
      sender: "Sarah Chen",
      content: "Menu testing went great today! The new turkey and avocado combination is getting excellent feedback from our test customers. Should we move forward with adding it to the permanent menu?",
    });
    
    this.createMessage({
      sender: "Mike Rodriguez",
      content: "Equipment delivery is confirmed for tomorrow morning at 9 AM. I'll be there to oversee the installation and make sure everything is set up properly.",
    });
    
    this.createMessage({
      sender: "Jessica Park",
      content: "Weekly totals look strong. Great work everyone! We're seeing a 15% increase in sales compared to last week, especially on our signature sandwiches.",
    });
    
    // Seed meeting minutes
    this.createMeetingMinutes({
      title: "Weekly Planning Meeting",
      date: "Mar 15, 2024",
      summary: "Discussed Q2 expansion plans and staff scheduling. Reviewed budget allocations for new equipment and training programs. Set timeline for downtown location opening.",
      color: "blue"
    });
    
    this.createMeetingMinutes({
      title: "Menu Review Session",
      date: "Mar 12, 2024",
      summary: "Finalized spring menu items and pricing structure. Approved three new sandwich options and seasonal drink additions. Discussed supplier negotiations.",
      color: "green"
    });
    
    this.createMeetingMinutes({
      title: "Training Workshop",
      date: "Mar 8, 2024",
      summary: "Customer service training and food safety protocols. Updated standard operating procedures and reviewed quality control measures.",
      color: "amber"
    });
    
    // Seed drive links
    this.createDriveLink({
      title: "Project Documents",
      description: "Shared project files and resources",
      url: "https://drive.google.com/drive/folders/project-docs",
      icon: "folder",
      iconColor: "blue"
    });
    
    this.createDriveLink({
      title: "Weekly Reports",
      description: "Sales data and performance metrics",
      url: "https://drive.google.com/drive/folders/weekly-reports",
      icon: "chart-line",
      iconColor: "green"
    });
    
    this.createDriveLink({
      title: "Menu & Recipes",
      description: "Current menu items and preparation guides",
      url: "https://drive.google.com/drive/folders/menu-recipes",
      icon: "utensils",
      iconColor: "amber"
    });
    
    this.createDriveLink({
      title: "Team Resources",
      description: "Training materials and schedules",
      url: "https://drive.google.com/drive/folders/team-resources",
      icon: "users",
      iconColor: "purple"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentIds.project++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Message methods
  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    const allMessages = await this.getAllMessages();
    return allMessages.slice(0, limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Weekly Report methods
  async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    return Array.from(this.weeklyReports.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const id = this.currentIds.weeklyReport++;
    const report: WeeklyReport = { 
      ...insertReport, 
      id, 
      submittedAt: new Date()
    };
    this.weeklyReports.set(id, report);
    return report;
  }

  // Sandwich Collection methods
  async getAllSandwichCollections(): Promise<SandwichCollection[]> {
    return Array.from(this.sandwichCollections.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async createSandwichCollection(insertCollection: InsertSandwichCollection): Promise<SandwichCollection> {
    const id = this.currentIds.sandwichCollection++;
    const collection: SandwichCollection = { 
      ...insertCollection, 
      id, 
      submittedAt: new Date()
    };
    this.sandwichCollections.set(id, collection);
    return collection;
  }

  // Meeting Minutes methods
  async getAllMeetingMinutes(): Promise<MeetingMinutes[]> {
    return Array.from(this.meetingMinutes.values());
  }

  async getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]> {
    const allMinutes = await this.getAllMeetingMinutes();
    return allMinutes.slice(0, limit);
  }

  async createMeetingMinutes(insertMinutes: InsertMeetingMinutes): Promise<MeetingMinutes> {
    const id = this.currentIds.meetingMinutes++;
    const minutes: MeetingMinutes = { ...insertMinutes, id };
    this.meetingMinutes.set(id, minutes);
    return minutes;
  }

  // Drive Link methods
  async getAllDriveLinks(): Promise<DriveLink[]> {
    return Array.from(this.driveLinks.values());
  }

  async createDriveLink(insertLink: InsertDriveLink): Promise<DriveLink> {
    const id = this.currentIds.driveLink++;
    const link: DriveLink = { ...insertLink, id };
    this.driveLinks.set(id, link);
    return link;
  }
}

export const storage = new MemStorage();
