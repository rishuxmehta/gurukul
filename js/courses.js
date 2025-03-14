// Course Management System for Gurrukul ગુરુકુળ
// This file handles API interactions for courses, enrollments, and reviews

const API_URL = 'http://localhost:5000/api/v1';

// ============== Course API Functions ==============

// Fetch all courses with optional filtering
async function fetchCourses(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_URL}/courses${queryString}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch courses');
    }

    return data.data.courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

// Fetch featured courses
async function fetchFeaturedCourses(limit = 6) {
  try {
    const response = await fetch(`${API_URL}/courses/featured?limit=${limit}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch featured courses');
    }

    return data.data.courses;
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    throw error;
  }
}

// Fetch courses by category
async function fetchCoursesByCategory(category) {
  try {
    const response = await fetch(`${API_URL}/courses/category/${category}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch courses by category');
    }

    return data.data.courses;
  } catch (error) {
    console.error(`Error fetching ${category} courses:`, error);
    throw error;
  }
}

// Get single course by ID
async function fetchCourseById(courseId) {
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch course');
    }

    return data.data.course;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

// Get course by slug (for SEO-friendly URLs)
async function fetchCourseBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/courses/slug/${slug}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch course');
    }

    return data.data.course;
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    throw error;
  }
}

// ============== Educator Course Management Functions ==============

// Get courses created by the logged-in educator
async function fetchMyCourses() {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/courses/my-courses`); // From auth.js
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your courses');
    }

    return data.data.courses;
  } catch (error) {
    console.error('Error fetching your courses:', error);
    throw error;
  }
}

// Create a new course
async function createCourse(courseData) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/courses`, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create course');
    }

    return data.data.course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

// Update an existing course
async function updateCourse(courseId, updateData) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update course');
    }

    return data.data.course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

// Delete a course (actually marks it as inactive)
async function deleteCourse(courseId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/courses/${courseId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete course');
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// ============== Enrollment Functions ==============

// Enroll in a course
async function enrollInCourse(courseId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/enrollments/courses/${courseId}/enroll`, {
      method: 'POST'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enroll in course');
    }

    return data.data.enrollment;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
}

// Get user's enrolled courses
async function fetchMyEnrollments() {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/enrollments/my-enrollments`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch enrollments');
    }

    return data.data.enrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
}

// Get a specific enrollment with full details
async function fetchEnrollment(enrollmentId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/enrollments/enrollments/${enrollmentId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch enrollment');
    }

    return data.data.enrollment;
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    throw error;
  }
}

// Mark a lesson as completed
async function markLessonAsCompleted(courseId, sectionId, lessonId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(
      `${API_URL}/enrollments/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/complete`,
      {
        method: 'POST'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark lesson as completed');
    }

    return data.data.enrollment;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
}

// Save quiz results
async function saveQuizResults(courseId, quizId, results) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(
      `${API_URL}/enrollments/courses/${courseId}/quizzes/${quizId}/results`,
      {
        method: 'POST',
        body: JSON.stringify(results)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save quiz results');
    }

    return data.data.enrollment;
  } catch (error) {
    console.error('Error saving quiz results:', error);
    throw error;
  }
}

// Request a certificate
async function requestCertificate(enrollmentId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(
      `${API_URL}/enrollments/enrollments/${enrollmentId}/certificate`,
      {
        method: 'POST'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to request certificate');
    }

    return data.data.certificate;
  } catch (error) {
    console.error('Error requesting certificate:', error);
    throw error;
  }
}

// Get a certificate
async function getCertificate(enrollmentId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(
      `${API_URL}/enrollments/enrollments/${enrollmentId}/certificate`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get certificate');
    }

    return data.data.certificate;
  } catch (error) {
    console.error('Error getting certificate:', error);
    throw error;
  }
}

// For educators: Get enrollments for a specific course
async function getCourseEnrollments(courseId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(
      `${API_URL}/enrollments/courses/${courseId}/enrollments`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get course enrollments');
    }

    return data.data.enrollments;
  } catch (error) {
    console.error('Error getting course enrollments:', error);
    throw error;
  }
}

// ============== Review Functions ==============

// Get reviews for a course
async function getCourseReviews(courseId) {
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}/reviews`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reviews');
    }

    return data.data.reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

// Submit a review for a course
async function submitReview(courseId, reviewData) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/courses/${courseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit review');
    }

    return data.data.review;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

// Get the user's own reviews
async function getMyReviews() {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/reviews/my-reviews`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your reviews');
    }

    return data.data.reviews;
  } catch (error) {
    console.error('Error fetching your reviews:', error);
    throw error;
  }
}

// Update a review
async function updateReview(reviewId, reviewData) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update review');
    }

    return data.data.review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

// Delete a review
async function deleteReview(reviewId) {
  try {
    const token = getAuthToken(); // From auth.js
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await protectedFetch(`${API_URL}/reviews/${reviewId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete review');
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// ============== UI Helper Functions ==============

// Format course display card
function createCourseCard(course) {
  return `
    <div class="course-card" data-id="${course._id}">
      <div class="course-image">
        <img src="${course.imageCover || 'img/default-course.jpg'}" alt="${course.title}">
        ${course.featured ? '<span class="badge featured">Featured</span>' : ''}
        <span class="badge category">${course.category}</span>
      </div>
      <div class="course-content">
        <h3 class="course-title">${course.title}</h3>
        <div class="course-info">
          <span class="level"><i class="fas fa-signal"></i> ${course.level}</span>
          <span class="duration"><i class="fas fa-clock"></i> ${course.duration} ${course.durationUnit}</span>
        </div>
        <div class="course-educator">
          <img src="${course.educator.avatar || 'img/default-avatar.jpg'}" alt="${course.educator.name}">
          <span>${course.educator.name}</span>
        </div>
        <div class="course-footer">
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>${course.ratingsAverage} (${course.ratingsQuantity})</span>
          </div>
          <div class="price">
            ${course.price === 0 ? 
              '<span class="free">Free</span>' : 
              `<span>₹${course.price}</span>${course.priceDiscount ? `<span class="discount">₹${course.priceDiscount}</span>` : ''}`
            }
          </div>
        </div>
      </div>
      <a href="course-details.html?slug=${course.slug}" class="course-link"></a>
    </div>
  `;
}

// Format enrollment card for student dashboard
function createEnrollmentCard(enrollment) {
  const course = enrollment.course;
  return `
    <div class="enrollment-card" data-id="${enrollment._id}">
      <div class="enrollment-image">
        <img src="${course.imageCover || 'img/default-course.jpg'}" alt="${course.title}">
      </div>
      <div class="enrollment-content">
        <h3 class="enrollment-title">${course.title}</h3>
        <div class="enrollment-info">
          <span class="category">${course.category}</span>
          <span class="level">${course.level}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" style="width: ${enrollment.progress}%"></div>
          </div>
          <span class="progress-text">${enrollment.progress}% completed</span>
        </div>
        ${enrollment.certificate && enrollment.certificate.issued ? 
          `<div class="certificate-badge">
            <i class="fas fa-certificate"></i> Certificate Earned
          </div>` : ''
        }
      </div>
      <a href="learn.html?enrollment=${enrollment._id}" class="enrollment-link">Continue Learning</a>
    </div>
  `;
}

// Initialize course listing page
async function initCourseListings() {
  try {
    const courseContainer = document.getElementById('courses-container');
    const filterForm = document.getElementById('course-filters');
    
    if (!courseContainer) return;
    
    // Apply filters when form is submitted
    if (filterForm) {
      filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(filterForm);
        const filters = {};
        
        for (const [key, value] of formData.entries()) {
          if (value) filters[key] = value;
        }
        
        const courses = await fetchCourses(filters);
        
        // Clear and repopulate the course container
        courseContainer.innerHTML = '';
        if (courses.length === 0) {
          courseContainer.innerHTML = '<p class="no-results">No courses found matching your criteria.</p>';
          return;
        }
        
        courses.forEach(course => {
          courseContainer.innerHTML += createCourseCard(course);
        });
      });
    }
    
    // Initial load without filters
    const courses = await fetchCourses();
    
    courseContainer.innerHTML = '';
    courses.forEach(course => {
      courseContainer.innerHTML += createCourseCard(course);
    });
  } catch (error) {
    console.error('Error initializing course listings:', error);
    document.getElementById('courses-container').innerHTML = 
      `<p class="error-message">Failed to load courses. ${error.message}</p>`;
  }
}

// Initialize featured courses section
async function initFeaturedCourses() {
  try {
    const featuredContainer = document.getElementById('featured-courses');
    
    if (!featuredContainer) return;
    
    const courses = await fetchFeaturedCourses();
    
    featuredContainer.innerHTML = '';
    if (courses.length === 0) {
      featuredContainer.innerHTML = '<p class="no-results">No featured courses available.</p>';
      return;
    }
    
    courses.forEach(course => {
      featuredContainer.innerHTML += createCourseCard(course);
    });
  } catch (error) {
    console.error('Error initializing featured courses:', error);
    document.getElementById('featured-courses').innerHTML = 
      `<p class="error-message">Failed to load featured courses. ${error.message}</p>`;
  }
}

// Initialize course category sections
async function initCourseCategories() {
  const categories = ['Coding', 'Farming', 'Cooking', 'Carpentry'];
  
  for (const category of categories) {
    try {
      const categoryContainer = document.getElementById(`${category.toLowerCase()}-courses`);
      
      if (!categoryContainer) continue;
      
      const courses = await fetchCoursesByCategory(category);
      
      categoryContainer.innerHTML = '';
      if (courses.length === 0) {
        categoryContainer.innerHTML = `<p class="no-results">No ${category} courses available.</p>`;
        continue;
      }
      
      courses.forEach(course => {
        categoryContainer.innerHTML += createCourseCard(course);
      });
    } catch (error) {
      console.error(`Error initializing ${category} courses:`, error);
      document.getElementById(`${category.toLowerCase()}-courses`).innerHTML = 
        `<p class="error-message">Failed to load ${category} courses. ${error.message}</p>`;
    }
  }
}

// Initialize student dashboard enrolled courses
async function initStudentEnrollments() {
  try {
    const enrollmentsContainer = document.getElementById('my-enrollments');
    
    if (!enrollmentsContainer) return;
    
    const enrollments = await fetchMyEnrollments();
    
    enrollmentsContainer.innerHTML = '';
    if (enrollments.length === 0) {
      enrollmentsContainer.innerHTML = '<p class="no-results">You are not enrolled in any courses yet.</p>';
      return;
    }
    
    enrollments.forEach(enrollment => {
      enrollmentsContainer.innerHTML += createEnrollmentCard(enrollment);
    });
  } catch (error) {
    console.error('Error initializing student enrollments:', error);
    document.getElementById('my-enrollments').innerHTML = 
      `<p class="error-message">Failed to load your enrollments. ${error.message}</p>`;
  }
}

// Initialize page based on current view
document.addEventListener('DOMContentLoaded', function() {
  // Initialize course listings page
  const coursesPage = document.getElementById('courses-page');
  if (coursesPage) {
    initCourseListings();
  }
  
  // Initialize homepage with featured and category courses
  const homePage = document.getElementById('home-page');
  if (homePage) {
    initFeaturedCourses();
    initCourseCategories();
  }
  
  // Initialize student dashboard
  const studentDashboard = document.getElementById('student-dashboard');
  if (studentDashboard) {
    initStudentEnrollments();
  }
  
  // Initialize course details page
  const courseDetails = document.getElementById('course-details');
  if (courseDetails) {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
      initCourseDetails(slug);
    }
  }
}); 