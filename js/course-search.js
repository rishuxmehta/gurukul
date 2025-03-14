document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const courseSearchInput = document.getElementById('courseSearch');
    const searchButton = document.querySelector('.search-btn');
    const categoryFilter = document.getElementById('categoryFilter');
    const levelFilter = document.getElementById('levelFilter');
    const durationFilter = document.getElementById('durationFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    // Sample course data (in a real application, this would come from a database)
    const courses = [
        {
            id: 1,
            title: 'Web Development Fundamentals',
            category: 'technology',
            level: 'beginner',
            duration: 'medium', // 12 weeks
            rating: 4.9,
            instructor: 'Dr. Sarah Johnson',
            image: 'images/course-placeholder.jpg',
            description: 'Learn the fundamentals of web development, HTML, CSS, and JavaScript.',
            enrolledStudents: 3245,
            price: 49.99
        },
        {
            id: 2,
            title: 'Introduction to Data Science',
            category: 'science',
            level: 'intermediate',
            duration: 'medium', // 10 weeks
            rating: 4.7,
            instructor: 'Prof. Michael Chen',
            image: 'images/course-placeholder.jpg',
            description: 'Master data analysis, visualization, and machine learning basics.',
            enrolledStudents: 2129,
            price: 59.99
        },
        {
            id: 3,
            title: 'Mobile App Development',
            category: 'technology',
            level: 'intermediate',
            duration: 'short', // 8 weeks
            rating: 4.8,
            instructor: 'Jennifer Taylor',
            image: 'images/course-placeholder.jpg',
            description: 'Build your own mobile applications for iOS and Android platforms.',
            enrolledStudents: 1876,
            price: 54.99
        },
        // Add more course data as needed
    ];
    
    // Event listeners
    searchButton.addEventListener('click', performSearch);
    courseSearchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Also trigger search when filters change
    categoryFilter.addEventListener('change', performSearch);
    levelFilter.addEventListener('change', performSearch);
    durationFilter.addEventListener('change', performSearch);
    ratingFilter.addEventListener('change', performSearch);
    
    function performSearch() {
        const searchTerm = courseSearchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const level = levelFilter.value;
        const duration = durationFilter.value;
        const rating = ratingFilter.value ? parseFloat(ratingFilter.value) : 0;
        
        // Filter courses based on search criteria
        const filteredCourses = courses.filter(course => {
            // Match search term
            const matchesSearchTerm = !searchTerm || 
                course.title.toLowerCase().includes(searchTerm) || 
                course.instructor.toLowerCase().includes(searchTerm) || 
                course.description.toLowerCase().includes(searchTerm);
            
            // Match category
            const matchesCategory = !category || course.category === category;
            
            // Match level
            const matchesLevel = !level || course.level === level;
            
            // Match duration
            const matchesDuration = !duration || course.duration === duration;
            
            // Match rating
            const matchesRating = !rating || course.rating >= rating;
            
            return matchesSearchTerm && matchesCategory && matchesLevel && matchesDuration && matchesRating;
        });
        
        displaySearchResults(filteredCourses);
    }
    
    function displaySearchResults(results) {
        // In a real application, this would update the DOM with search results
        console.log('Search results:', results);
        
        // For now, let's add a simple implementation
        // Find the featured courses section to replace its content with search results
        const featuredCoursesSection = document.querySelector('.featured-courses .courses-grid');
        if (!featuredCoursesSection) return;
        
        // Clear current courses
        featuredCoursesSection.innerHTML = '';
        
        if (results.length === 0) {
            featuredCoursesSection.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            `;
            return;
        }
        
        // Add search results
        results.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="course-image">
                    <img src="${course.image}" alt="${course.title}">
                    <div class="course-category">${capitalizeFirstLetter(course.category)}</div>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <div class="course-info">
                        <span><i class="fas fa-clock"></i> ${getDurationText(course.duration)}</span>
                        <span><i class="fas fa-user-graduate"></i> ${course.enrolledStudents} students</span>
                    </div>
                    <p>${course.description}</p>
                    <div class="course-instructor">
                        <img src="images/avatar-placeholder.jpg" alt="${course.instructor}">
                        <span>${course.instructor}</span>
                    </div>
                    <div class="course-rating">
                        ${getRatingStars(course.rating)}
                        <span>${course.rating} (${Math.floor(course.enrolledStudents / 10)} reviews)</span>
                    </div>
                    <div class="course-price">
                        <span>$${course.price}</span>
                    </div>
                    <a href="#" class="btn btn-outline">Learn More</a>
                </div>
            `;
            featuredCoursesSection.appendChild(courseCard);
        });
        
        // Update the section header
        const sectionHeader = document.querySelector('.featured-courses .section-header h2');
        if (sectionHeader) {
            sectionHeader.textContent = 'Search Results';
        }
    }
    
    // Helper functions
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function getDurationText(duration) {
        switch (duration) {
            case 'short': return '0-4 weeks';
            case 'medium': return '5-12 weeks';
            case 'long': return '13+ weeks';
            default: return 'Varies';
        }
    }
    
    function getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Add half star if needed
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
}); 