const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Validate that MONGO_URI is provided and is an Atlas connection
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    if (!process.env.MONGO_URI.includes("mongodb+srv://")) {
      throw new Error("MONGO_URI must be a MongoDB Atlas connection string (mongodb+srv://)");
    }

    // MongoDB Atlas connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📍 Cluster: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed:`);
    console.error(`Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes("ENOTFOUND")) {
      console.error("💡 Check: Cluster URL is correct and cluster is accessible");
    } else if (error.message.includes("authentication")) {
      console.error("💡 Check: Username, password, and database user permissions");
    } else if (error.message.includes("IP not whitelisted")) {
      console.error("💡 Check: Your IP address is whitelisted in Atlas Network Access");
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
