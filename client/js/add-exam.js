/**
 * Add Exam Type Page JavaScript
 * Handles form validation and submission
 */

document.addEventListener('DOMContentLoaded', () => {
    initAddExamForm();
});

/**
 * Initialize the Add Exam Form
 */
function initAddExamForm() {
    const addExamForm = document.getElementById('add-exam-form');
    
    const logoInput = document.getElementById('exam-logo');
    const logoPreview = document.getElementById('logo-preview');
    const examNameInput = document.getElementById('exam-name');
    const examTypeSelect = document.getElementById('exam-type');
    const examDataInput = document.getElementById('exam-data');
    
    const logoError = document.getElementById('logo-error');
    const nameError = document.getElementById('name-error');
    const typeError = document.getElementById('type-error');
    const dataError = document.getElementById('data-error');
    
    // Preview logo when selected
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        logoError.textContent = '';
        
        if (file) {
            // Validate file type (whitelist approach)
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                logoError.textContent = 'Only PNG and JPEG images are allowed';
                logoInput.value = '';
                return;
            }
            
            // Validate file size (max 1MB)
            if (file.size > 1024 * 1024) {
                logoError.textContent = 'Image size must be less than 1MB';
                logoInput.value = '';
                return;
            }
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = (e) => {
                logoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Validate exam name (English letters only)
    examNameInput.addEventListener('input', () => {
        nameError.textContent = '';
        const nameRegex = /^[A-Za-z\s]+$/;
        
        if (examNameInput.value && !nameRegex.test(examNameInput.value)) {
            nameError.textContent = 'Only English letters and spaces are allowed';
        }
    });
    
    // Validate JSON file
    examDataInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        dataError.textContent = '';
        
        if (file) {
            // Validate file type
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                dataError.textContent = 'Only JSON files are allowed';
                examDataInput.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                dataError.textContent = 'File size must be less than 5MB';
                examDataInput.value = '';
                return;
            }
        }
    });
    
    // Handle form submission
    addExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear all error messages
        logoError.textContent = '';
        nameError.textContent = '';
        typeError.textContent = '';
        dataError.textContent = '';
        
        // Validate the form inputs
        let isValid = true;
        
        // Check logo
        if (!logoInput.files || logoInput.files.length === 0) {
            logoError.textContent = 'Please select an exam logo';
            isValid = false;
        }
        
        // Check exam name
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!examNameInput.value) {
            nameError.textContent = 'Please enter an exam name';
            isValid = false;
        } else if (!nameRegex.test(examNameInput.value)) {
            nameError.textContent = 'Only English letters and spaces are allowed';
            isValid = false;
        }
        
        // Check exam type
        if (!examTypeSelect.value) {
            typeError.textContent = 'Please select an exam type';
            isValid = false;
        }
        
        // Check exam data
        if (!examDataInput.files || examDataInput.files.length === 0) {
            dataError.textContent = 'Please select a JSON file';
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Process form submission
        try {
            // Read the JSON file
            const jsonFile = examDataInput.files[0];
            const jsonContent = await readFileAsText(jsonFile);
            
            // Parse JSON to validate format
            try {
                const jsonData = JSON.parse(jsonContent);
                
                // Validate the JSON structure
                if (!jsonData.questions || !Array.isArray(jsonData.questions) || jsonData.questions.length === 0) {
                    dataError.textContent = 'Invalid JSON format. File must contain a "questions" array.';
                    return;
                }
                
                // Process the logo
                const logoFile = logoInput.files[0];
                const logoBase64 = await readFileAsDataURL(logoFile);
                
                // Create exam type object
                const examType = {
                    id: generateExamTypeId(examNameInput.value),
                    name: examNameInput.value,
                    type: examTypeSelect.value,
                    logo: logoBase64,
                    dataFile: jsonFile.name,
                    dateAdded: new Date().toISOString()
                };
                
                // Save to local storage
                saveExamType(examType, jsonContent);
                
                // Show success message
                showNotification(`Exam "${examNameInput.value}" added successfully!`, 'success');
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (parseError) {
                dataError.textContent = 'Invalid JSON format. Please check the file.';
                console.error('JSON parse error:', parseError);
            }
        } catch (error) {
            console.error('Error processing form:', error);
            showNotification('Error adding exam type. Please try again.', 'error');
        }
    });
    
    // Helper function to read file as text
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // Helper function to read file as Data URL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }
    
    // Generate a unique ID for the exam type
    function generateExamTypeId(name) {
        return 'exam-' + name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    }
    
    // Save exam type to local storage
    function saveExamType(examType, jsonContent) {
        // Get existing exam types
        let examTypes = JSON.parse(localStorage.getItem('examTypes')) || [];
        
        // Add the new exam type
        examTypes.push(examType);
        
        // Save to local storage
        localStorage.setItem('examTypes', JSON.stringify(examTypes));
        
        // Save the JSON data
        localStorage.setItem('examData_' + examType.id, jsonContent);
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success/error/info)
     */
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = type;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}