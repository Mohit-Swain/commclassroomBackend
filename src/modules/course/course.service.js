/** load required packages */
const { NotFoundException } = require('http-exception-transformer/exceptions');

/** load peer modules and services */
const Course = require('./course.schema');

/**
 * CourseService operates on the data layer of the application, and performs *all* db operations.
 *
 * CourseService is consumed not only by CourseController, but also by controllers of other modules.
 */
class CourseService {
  /**
   * Function to calculate avg. rating from enrollements.
   * @param {Array<{user: objectId,rating: Number}>} enrollements - The students enrolled in the course.
   * @returns {number | undefined} - The average rating if possible else undefined
   */
  static getAvgRating(enrollements) {
    if (!enrollements) {
      return undefined;
    }
    // filtering all the enrollements with a rating.
    const enrollementsWithRatings = enrollements.filter(
      (enrollement) => enrollement.rating,
    );
    const len = enrollementsWithRatings.length;
    if (len === 0) {
      return undefined;
    }
    const sumofRatings = enrollementsWithRatings.reduce((sum, enrollement) => {
      return sum + enrollement.rating;
    }, 0);

    return sumofRatings / len;
  }

  /**
   * Fetch all course details
   * @returns {Array<Course>} list of courses in the system
   */
  static async findAllCourses() {
    const CourseList = await Course.find({});
    return CourseList;
  }

  /**
   * Fetch a course by Id
   * @param {ObjectId} id - ObjectId of the course to get
   */
  static async findCourseById(id) {
    const course = await Course.findById(id);
    if (!course) {
      // course not found
      throw new NotFoundException();
    }
    return course;
  }

  /**
   * Create a course.
   * @param {string} title - The title of the course.
   * @param {Array<{name : string}>} instructors - The instuctors of the course.
   * @param {Array<{user: objectId,rating: Number}>} enrollements - The students enrolled in the course.
   * @param {bool} featured - Is the course featured
   * @param {Array<string>} tags - Tags related to the course
   * @param {string} playlistId - YouTube playlist id
   */
  static async createNewCourse(
    title,
    instructors,
    enrollements,
    featured,
    tags,
    playlistId,
  ) {
    const course = new Course();
    course.title = title;
    course.instructors = instructors;
    course.enrollements = enrollements;
    course.course_rating = this.getAvgRating(course.enrollements);
    course.featured = featured || false;
    course.tags = tags;
    course.playlistId = playlistId;
    const savedCourse = await course.save();
    return savedCourse;
  }

  /**
   * Update a course.
   * @param {ObjectId} id - The id of the course to update
   * @param {string} title - The title of the course.
   * @param {Array<{name : string}>} instructors - The instuctors of the course.
   * @param {Array<{user: objectId,rating: Number}>} enrollements - The students enrolled in the course.
   * @param {bool} featured - Is the course featured
   * @param {Array<string>} tags - Tags related to the course
   * @param {string} playlistId - YouTube playlist id
   */
  static async updateCourse(
    id,
    title,
    instructors,
    enrollements,
    featured,
    tags,
    playlistId,
  ) {
    const course = await Course.findById(id);
    if (!course) {
      // course not found
      throw new NotFoundException();
    }
    course.title = title;
    course.instructors = instructors;
    course.enrollements = enrollements;
    course.course_rating = this.getAvgRating(course.enrollements);
    course.featured = featured || false;
    course.tags = tags;
    course.playlistId = playlistId;
    const savedCourse = await course.save();
    return savedCourse;
  }

  /**
   * Delete a course by Id
   * @param {ObjectId} id - ObjectId of the course to delete
   * @returns {Course | null} returns Course if delete successful else null
   */
  static async deleteCourse(id) {
    const deletedCourse = await Course.findByIdAndDelete(id);
    return deletedCourse;
  }
}

module.exports = { CourseService };
