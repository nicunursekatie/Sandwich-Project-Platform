import { db } from "./db";
import { hosts, sandwichCollections, projects, messages, weeklyReports, meetingMinutes, driveLinks, agendaItems, meetings, driverAgreements, recipients } from "@shared/schema";
import { eq, count } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("Checking database initialization...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL preview:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "not set");

    // Check each table independently and seed if empty
    const [hostsCount] = await db.select({ count: count() }).from(hosts);
    const [projectsCount] = await db.select({ count: count() }).from(projects);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    const [collectionsCount] = await db.select({ count: count() }).from(sandwichCollections);
    const [recipientsCount] = await db.select({ count: count() }).from(recipients);

    console.log("Table counts - Hosts:", hostsCount.count, "Projects:", projectsCount.count, "Messages:", messagesCount.count, "Collections:", collectionsCount.count, "Recipients:", recipientsCount.count);

    // Only seed if ALL tables are completely empty (first time setup)
    if (hostsCount.count === 0 && projectsCount.count === 0 && messagesCount.count === 0 && collectionsCount.count === 0) {
      console.log("Seeding hosts table...");
      await db.insert(hosts).values([
        {
          name: "Alex Thompson",
          email: "alex.thompson@email.com", 
          phone: "(555) 111-2222",
          status: "active",
          notes: "Regular Saturday collections"
        },
        {
          name: "Maria Gonzalez",
          email: "maria.gonzalez@email.com",
          phone: "(555) 333-4444", 
          status: "active",
          notes: "Specializes in large group events"
        },
        {
          name: "David Kim",
          email: "david.kim@email.com",
          phone: "(555) 555-6666",
          status: "active", 
          notes: "Weekday collections preferred"
        },
        {
          name: "Rachel Williams",
          email: "rachel.williams@email.com",
          phone: "(555) 777-8888",
          status: "active",
          notes: "Available for emergency collections"
        },
        {
          name: "James Anderson", 
          email: "james.anderson@email.com",
          phone: "(555) 999-0000",
          status: "inactive",
          notes: "On temporary leave"
        }
      ]);
    }

    // Only seed collections if they're empty (no duplicate variable declaration needed)
    if (collectionsCount.count === 0) {
      console.log("Seeding sandwich collections table...");
      await db.insert(sandwichCollections).values([
        {
          collectionDate: "2025-06-05",
          hostName: "Alex Thompson", 
          individualSandwiches: 15,
          groupCollections: "Marketing Team: 8, Development: 6"
        },
        {
          collectionDate: "2025-06-03",
          hostName: "Maria Gonzalez",
          individualSandwiches: 22,
          groupCollections: "Sales: 12, Support: 5"
        },
        {
          collectionDate: "2025-05-30", 
          hostName: "David Kim",
          individualSandwiches: 18,
          groupCollections: "Executive: 4, Operations: 9"
        },
        {
          collectionDate: "2025-05-28",
          hostName: "Rachel Williams", 
          individualSandwiches: 12,
          groupCollections: "Finance: 7"
        }
      ]);
    }

    // Seed recipients if empty
    if (recipientsCount.count === 0) {
      console.log("Seeding recipients table...");
      await db.insert(recipients).values([
        {
          name: "Boys and Girls Club",
          phone: "404-516-0938",
          email: "kevin.johnson@uss.salvationarmy.org",
          address: "Downtown (west side)",
          preferences: "turkey, Weekly Estimate: 100",
          status: "active"
        },
        {
          name: "Community Assistance Center",
          phone: "954-350-2756",
          email: "gretty.figueroa@ourcac.org",
          address: "Sandy Springs",
          preferences: "deli only, Weekly Estimate: 200",
          status: "active"
        },
        {
          name: "Cross Cultural Ministries",
          phone: "404-790-0459",
          email: null,
          address: "Dunwoody (Karen)",
          preferences: null,
          status: "active"
        },
        {
          name: "Focus Recovery (Veterans Program)",
          phone: "404-247-6447",
          email: null,
          address: "Dunwoody (Karen)",
          preferences: null,
          status: "active"
        },
        {
          name: "Gateway Center",
          phone: "404-215-6651",
          email: "dbenton@gatewatctr.org",
          address: "Downtown",
          preferences: "deli (will take pbj if necessary), Weekly Estimate: 700-1000+",
          status: "active"
        },
        {
          name: "Giving Grace /Remerge",
          phone: "678-437-2024",
          email: null,
          address: "Dunwoody (Karen)",
          preferences: "pb&j, Weekly Estimate: 100",
          status: "active"
        },
        {
          name: "Hope Atlanta",
          phone: null,
          email: "aolvey@hopeatlanta.org",
          address: "Midtown (Ponce/Boulevard)",
          preferences: null,
          status: "active"
        },
        {
          name: "Intown Cares",
          phone: null,
          email: "Laura.DeGroot@intowncares.org",
          address: "Midtown (Ponce/Boulevard)",
          preferences: null,
          status: "active"
        },
        {
          name: "Lettum Eat",
          phone: "850-381-5936",
          email: "info@lettumeat.com",
          address: "Snellville",
          preferences: null,
          status: "active"
        },
        {
          name: "Melody (City of Atlanta/Hope Atlanta)",
          phone: "470-233-2362",
          email: "rland@hopeatlanta.org",
          address: "Downtown",
          preferences: "60 deli & 60 pbj, Weekly Estimate: 120",
          status: "active"
        },
        {
          name: "Omega Support Center",
          phone: "770-362-6627",
          email: "omegaservesall@gmail.com",
          address: "Tucker",
          preferences: null,
          status: "active"
        },
        {
          name: "St. Vincent de Paul (Outreach Program)",
          phone: null,
          email: "aseeley@svdpgeorgia.org",
          address: "Chamblee",
          preferences: "deli (will take pbj), Weekly Estimate: 500+",
          status: "active"
        },
        {
          name: "The Elizabeth Foundation",
          phone: "404-468-6503",
          email: "tracy@elizabethfoundation.org",
          address: "Buckhead",
          preferences: null,
          status: "active"
        },
        {
          name: "The Shrine of The Immaculate Conception",
          phone: "404-840-6267",
          email: "tilla@catholicshrineatlanta.org",
          address: "Downtown",
          preferences: "deli and want pbj weekly, Weekly Estimate: 500 (varies)",
          status: "active"
        },
        {
          name: "The Table on Delk",
          phone: "407-509-2799",
          email: "thetableondelk@gmail.com",
          address: "Marietta",
          preferences: null,
          status: "active"
        },
        {
          name: "The Zone (Davis Direction Foundation)",
          phone: "404-437-8522",
          email: "daniel.spinney@davisdirection.com",
          address: "Marietta",
          preferences: null,
          status: "active"
        },
        {
          name: "Toco Hills Community Alliance",
          phone: "404-375-9875",
          email: "lisa@tocohillsalliance.org",
          address: "Toco Hills/Emory",
          preferences: null,
          status: "active"
        },
        {
          name: "Zaban Paradies Center",
          phone: "770-687-7520",
          email: "rnation@zabanparadiescenter.org",
          address: "Midtown",
          preferences: "deli, Weekly Estimate: 300",
          status: "active"
        },
        {
          name: "Eye Believe Foundation",
          phone: null,
          email: null,
          address: null,
          preferences: "any, Weekly Estimate: 1000-3000",
          status: "active"
        },
        {
          name: "True Worship / Angie's Kitchen",
          phone: "404-287-8292",
          email: "helen@angieskitchen.org",
          address: null,
          preferences: "as requested consistently",
          status: "active"
        },
        {
          name: "City of Atlanta Mayor's Office Initiative",
          phone: "404-215-6600",
          email: "chchu@atlantaga.gov",
          address: null,
          preferences: "by request consistently",
          status: "active"
        },
        {
          name: "Operation Peace",
          phone: "404-347-4040",
          email: "opeace@bellsouth.net",
          address: null,
          preferences: "as needed consistently",
          status: "active"
        },
        {
          name: "The Goodman Group",
          phone: "757-338-2668",
          email: "thegoodmangrouporg@gmail.com",
          address: null,
          preferences: "as requested (often)",
          status: "active"
        }
      ]);
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Don't throw - allow app to continue with fallback storage
  }
}