require('colors');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

dotenv.config({ path: './config/config.env' });

mongoose.connect(process.env.LOCAL_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// Import into Db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('Data Imported Successfully ...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const destroyData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log('Data Destroyed Successfully....'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Get argument from cli
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  destroyData();
}
