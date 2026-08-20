require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required to run seed script.');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, lowercase: true, unique: true },
    password: String,
    role: String,
    flatNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    priority: String,
    flatNumber: String,
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Pending' },
    statusNote: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to Society Connect MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully.');

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const initialUsers = [
      {
        name: 'Society Administrator',
        email: 'admin@societyconnect.com',
        password: hashedPassword,
        role: 'Admin',
        flatNumber: '',
        phone: '+1 555-0100',
      },
      {
        name: 'Maintenance Manager',
        email: 'manager@societyconnect.com',
        password: hashedPassword,
        role: 'Manager',
        flatNumber: '',
        phone: '+1 555-0101',
      },
      {
        name: 'John Resident',
        email: 'john@societyconnect.com',
        password: hashedPassword,
        role: 'Member',
        flatNumber: 'Tower A - 402',
        phone: '+1 555-0102',
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@societyconnect.com',
        password: hashedPassword,
        role: 'Member',
        flatNumber: 'Tower B - 105',
        phone: '+1 555-0103',
      },
    ];

    console.log('\n--- Seeding Users ---');
    const createdUsers = {};
    for (const u of initialUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`✅ Created ${u.role}: ${u.email}`);
      } else {
        console.log(`ℹ️  Already exists: ${u.email}`);
      }
      createdUsers[u.email] = existing;
    }

    console.log('\n--- Seeding Sample Tickets ---');
    const sampleTickets = [
      {
        title: 'Corridor Light Flickering',
        description: 'The light fixture outside flat A-402 is constantly flickering and creating noise.',
        category: 'Electrical',
        priority: 'Medium',
        flatNumber: 'Tower A - 402',
        raisedBy: createdUsers['john@societyconnect.com']._id,
        status: 'Pending',
      },
      {
        title: 'Water Leakage in Kitchen Pipe',
        description: 'Main incoming valve has a persistent drip causing moisture under the sink.',
        category: 'Plumbing',
        priority: 'High',
        flatNumber: 'Tower A - 402',
        raisedBy: createdUsers['john@societyconnect.com']._id,
        status: 'In Progress',
        statusNote: 'Plumber scheduled for inspection today at 4 PM.',
      },
      {
        title: 'Elevator B Making Squeaking Sound',
        description: 'Tower B right-side elevator squeaks heavily when descending between floors 3 and 1.',
        category: 'Elevator',
        priority: 'Urgent',
        flatNumber: 'Tower B - 105',
        raisedBy: createdUsers['sarah@societyconnect.com']._id,
        status: 'Pending',
      },
      {
        title: 'Lobby Glass Door Handle Loose',
        description: 'The entrance glass door push handle is wobbling and needs tightening.',
        category: 'Carpentry',
        priority: 'Low',
        flatNumber: 'Tower B - 105',
        raisedBy: createdUsers['sarah@societyconnect.com']._id,
        status: 'Resolved',
        statusNote: 'Replaced screws and tightened bracket on 18th Feb.',
      },
    ];

    for (const t of sampleTickets) {
      const existing = await Ticket.findOne({ title: t.title, flatNumber: t.flatNumber });
      if (!existing) {
        await Ticket.create(t);
        console.log(`✅ Created ticket: "${t.title}" (${t.status})`);
      } else {
        console.log(`ℹ️  Ticket already exists: "${t.title}"`);
      }
    }

    console.log('\n🎉 Database Seed Successful!');
    console.log('Credentials (all accounts): Password123!');
    console.log('- Admin:   admin@societyconnect.com');
    console.log('- Manager: manager@societyconnect.com');
    console.log('- Member:  john@societyconnect.com');
    console.log('- Member:  sarah@societyconnect.com');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
