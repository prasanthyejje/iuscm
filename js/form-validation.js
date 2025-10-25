// Form Validation JavaScript (UI Only - No Backend)

(function() {
    'use strict';

    // Validation rules
    const validationRules = {
        required: {
            validate: (value) => value.trim().length > 0,
            message: 'This field is required'
        },
        email: {
            validate: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: 'Please enter a valid email address'
        },
        name: {
            validate: (value) => {
                const nameRegex = /^[a-zA-Z\s]{2,50}$/;
                return nameRegex.test(value);
            },
            message: 'Please enter a valid name (2-50 characters, letters only)'
        },
        minLength: {
            validate: (value, length) => value.trim().length >= length,
            message: (length) => `Must be at least ${length} characters`
        },
        maxLength: {
            validate: (value, length) => value.trim().length <= length,
            message: (length) => `Must be no more than ${length} characters`
        }
    };

    // Initialize all forms
    function init() {
        const forms = document.querySelectorAll('[data-validate]');
        forms.forEach(form => {
            setupForm(form);
        });
    }

    // Setup individual form
    function setupForm(form) {
        // Get all form inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        
        // Setup real-time validation
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => validateField(input));
            
            // Clear error on input
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('error')) {
                    clearError(input);
                }
            });
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => handleFormSubmit(e, form));
    }

    // Validate individual field
    function validateField(field) {
        const value = field.value;
        const rules = field.dataset.rules ? field.dataset.rules.split(' ') : [];
        const formGroup = field.closest('.form-group');
        
        // Clear any existing errors
        clearError(field);
        
        // Check each rule
        for (let rule of rules) {
            let isValid = true;
            let errorMessage = '';
            
            // Parse rule and parameters
            const [ruleName, ...params] = rule.split(':');
            
            // Apply validation based on rule
            switch(ruleName) {
                case 'required':
                    isValid = validationRules.required.validate(value);
                    errorMessage = validationRules.required.message;
                    break;
                    
                case 'email':
                    if (value.length > 0) { // Only validate if not empty
                        isValid = validationRules.email.validate(value);
                        errorMessage = validationRules.email.message;
                    }
                    break;
                    
                case 'name':
                    if (value.length > 0) {
                        isValid = validationRules.name.validate(value);
                        errorMessage = validationRules.name.message;
                    }
                    break;
                    
                case 'minLength':
                    const minLength = parseInt(params[0]) || 0;
                    isValid = validationRules.minLength.validate(value, minLength);
                    errorMessage = validationRules.minLength.message(minLength);
                    break;
                    
                case 'maxLength':
                    const maxLength = parseInt(params[0]) || 999999;
                    isValid = validationRules.maxLength.validate(value, maxLength);
                    errorMessage = validationRules.maxLength.message(maxLength);
                    break;
            }
            
            // Show error if validation failed
            if (!isValid) {
                showError(field, errorMessage);
                return false;
            }
        }
        
        return true;
    }

    // Show error message
    function showError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Add error class
        formGroup.classList.add('error');
        
        // Create or update error message
        let errorElement = formGroup.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add aria-invalid for accessibility
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorElement.id || 'error-' + field.id);
    }

    // Clear error message
    function clearError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
    }

    // Handle form submission
    function handleFormSubmit(e, form) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Log to console (since no backend)
            console.log('Form ready for backend integration:');
            console.log('Form ID:', form.id || 'unknown');
            console.log('Form Data:', data);
            console.log('Timestamp:', new Date().toISOString());
            
            // Show success message
            showSuccessMessage(form);
            
            // Reset form after 3 seconds
            setTimeout(() => {
                form.reset();
                hideSuccessMessage(form);
            }, 3000);
            
            // Trigger custom event
            const event = new CustomEvent('formSubmitSuccess', {
                detail: { formData: data }
            });
            form.dispatchEvent(event);
        } else {
            // Focus on first error field
            const firstError = form.querySelector('.form-group.error input, .form-group.error textarea');
            if (firstError) {
                firstError.focus();
            }
            
            // Show error toast
            showToast('Please correct the errors and try again', 'error');
        }
    }

    // Show success message
    function showSuccessMessage(form) {
        let successElement = form.querySelector('.form-success');
        
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'form-success';
            successElement.innerHTML = `
                <strong>Success!</strong> Your message has been received. 
                (Note: This is a demo - no actual submission occurred)
            `;
            form.appendChild(successElement);
        }
        
        successElement.classList.add('show');
        
        // Show success toast
        showToast('Form submitted successfully! (Demo mode - no backend)', 'success');
    }

    // Hide success message
    function hideSuccessMessage(form) {
        const successElement = form.querySelector('.form-success');
        if (successElement) {
            successElement.classList.remove('show');
        }
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;
        toast.textContent = message;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toast.remove();
                // Remove container if empty
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 5000);
    }

    // Add toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Public API
    window.formValidation = {
        validate: validateField,
        validateForm: (form) => {
            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            return isValid;
        },
        reset: (form) => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => clearError(input));
            form.reset();
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
