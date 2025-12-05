// Decimal to Binary Converter - Main Script

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        decimalInput: document.getElementById('decimalInput'),
        convertBtn: document.getElementById('convertBtn'),
        clearBtn: document.getElementById('clearBtn'),
        sampleBtn: document.getElementById('sampleBtn'),
        binaryResult: document.getElementById('binaryResult'),
        conversionDetails: document.getElementById('conversionDetails'),
        decimalError: document.getElementById('decimalError'),
        exampleItems: document.querySelectorAll('.example-item')
    };

    // Sample numbers for demonstration
    const sampleNumbers = [
        { decimal: "10", binary: "1010" },
        { decimal: "27.75", binary: "11011.11" },
        { decimal: "3.14159", binary: "11.001001000011..." },
        { decimal: "255", binary: "11111111" },
        { decimal: "42.125", binary: "101010.001" },
        { decimal: "7.5", binary: "111.1" },
        { decimal: "0.875", binary: "0.111" },
        { decimal: "15.625", binary: "1111.101" }
    ];

    // Current state
    let currentDecimal = "";
    let conversionTimeout = null;

    // Initialize the application
    function init() {
        setupEventListeners();
        loadInitialExample();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Real-time conversion with debouncing
        elements.decimalInput.addEventListener('input', handleInput);

        // Convert on Enter key press (use keydown for reliable Enter detection)
        elements.decimalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                convertDecimalToBinary();
            }
        });

        // Button events
        elements.convertBtn.addEventListener('click', convertDecimalToBinary);
        elements.clearBtn.addEventListener('click', clearInput);
        elements.sampleBtn.addEventListener('click', loadRandomSample);

        // Example items click events
        elements.exampleItems.forEach(item => {
            item.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                if (value) {
                    elements.decimalInput.value = value;
                    handleInput();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                elements.decimalInput.focus();
            }
            if (e.key === 'Escape') {
                clearInput();
            }
        });
    }

    // Handle input with debouncing
    function handleInput() {
        clearTimeout(conversionTimeout);
        
        // Validate input immediately
        const isValid = validateInput();
        
        // Show typing indicator
        if (elements.decimalInput.value.trim() && isValid) {
            elements.binaryResult.textContent = "Converting...";
            elements.binaryResult.className = "text-warning fw-bold fade-in";
        }
        
        // Debounce conversion by 300ms
        conversionTimeout = setTimeout(() => {
            if (isValid && elements.decimalInput.value.trim()) {
                convertDecimalToBinary();
            }
        }, 300);
    }

    // Validate decimal input
    function validateInput() {
        const input = elements.decimalInput.value.trim();
        elements.decimalError.textContent = '';
        
        // Clear validation classes
        elements.decimalInput.classList.remove('valid-input', 'invalid-input');
        
        if (input === '') {
            return false;
        }
        
        // Regular expression for valid decimal numbers
        const decimalRegex = /^[+]?(\d+(\.\d*)?|\.\d+)$/;
        
        if (!decimalRegex.test(input)) {
            elements.decimalInput.classList.add('invalid-input');
            elements.decimalError.textContent = 'Please enter a valid positive decimal number (e.g., 42, 15.625, or .75)';
            return false;
        }
        
        // Check if number is too large
        const num = parseFloat(input);
        if (num > 1000000) {
            elements.decimalInput.classList.add('invalid-input');
            elements.decimalError.textContent = 'Number too large. Please enter a number less than 1,000,000';
            return false;
        }
        
        elements.decimalInput.classList.add('valid-input');
        return true;
    }

    // Main conversion function
    function convertDecimalToBinary() {
        const input = elements.decimalInput.value.trim();
        
        if (!input) {
            elements.binaryResult.textContent = "Waiting for input...";
            elements.binaryResult.className = "text-secondary fw-bold";
            elements.conversionDetails.innerHTML = '';
            return;
        }
        
        if (!validateInput()) {
            elements.binaryResult.textContent = "Invalid input";
            elements.binaryResult.className = "text-danger fw-bold fade-in";
            return;
        }
        
        try {
            // Convert to binary
            const binary = decimalToBinary(input);
            
            // Update result display
            elements.binaryResult.textContent = binary;
            elements.binaryResult.className = "text-success fw-bold fade-in";
            
            // Show conversion details
            showConversionDetails(input, binary);
            
            // Update current decimal
            currentDecimal = input;
            
        } catch (error) {
            console.error('Conversion error:', error);
            elements.binaryResult.textContent = "Conversion error";
            elements.binaryResult.className = "text-danger fw-bold fade-in";
        }
    }

    // Convert decimal string to binary
    function decimalToBinary(decimalStr) {
        // Normalize input
        let normalized = decimalStr.trim();
        if (normalized.startsWith('+')) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith('.')) {
            normalized = '0' + normalized;
        }
        
        // Handle different cases
        if (normalized.includes('.')) {
            const [integerPart, fractionalPart] = normalized.split('.');
            return convertWithFraction(integerPart, fractionalPart);
        } else {
            return convertInteger(normalized);
        }
    }

    // Convert integer part to binary
    function convertInteger(integerStr) {
        let num = parseInt(integerStr, 10);
        
        if (num === 0) return '0';
        
        let binary = '';
        while (num > 0) {
            binary = (num % 2) + binary;
            num = Math.floor(num / 2);
        }
        return binary;
    }

    // Convert number with fractional part
    function convertWithFraction(integerPart, fractionalPart) {
        // Convert integer part
        let intBinary = convertInteger(integerPart || '0');
        
        // Convert fractional part if it exists
        let fracBinary = '';
        if (fractionalPart && fractionalPart !== '0') {
            let fraction = parseFloat('0.' + fractionalPart);
            let precision = 0;
            const maxPrecision = 16;
            
            fracBinary = '.';
            
            while (fraction > 0 && precision < maxPrecision) {
                fraction *= 2;
                if (fraction >= 1) {
                    fracBinary += '1';
                    fraction -= 1;
                } else {
                    fracBinary += '0';
                }
                precision++;
            }
            
            // Handle infinite fractions
            if (fraction > 0) {
                if (fracBinary.length > 12) {
                    fracBinary = fracBinary.substring(0, 12) + '...';
                }
            }
        } else if (fractionalPart === '0') {
            fracBinary = '.0';
        }
        
        return intBinary + fracBinary;
    }

    // Show conversion details
    function showConversionDetails(decimalStr, binaryResult) {
        elements.conversionDetails.innerHTML = '';
        
        if (!decimalStr.includes('.') || decimalStr.endsWith('.0')) {
            return; // Don't show details for simple integers
        }
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'conversion-step fade-in';
        
        const parts = decimalStr.split('.');
        const integerPart = parts[0] || '0';
        const fractionalPart = parts[1] || '0';
        
        let detailsHTML = `
            <h6><i class="bi bi-diagram-3 me-2"></i>Conversion Process</h6>
            <div class="mb-2">
                <strong>Integer part (${integerPart}):</strong>
                <div class="small text-muted mt-1">${getIntegerSteps(integerPart)}</div>
            </div>
        `;
        
        if (fractionalPart && fractionalPart !== '0') {
            detailsHTML += `
                <div>
                    <strong>Fractional part (0.${fractionalPart}):</strong>
                    <div class="small text-muted mt-1">${getFractionSteps(fractionalPart)}</div>
                </div>
            `;
        }
        
        detailsDiv.innerHTML = detailsHTML;
        elements.conversionDetails.appendChild(detailsDiv);
    }

    // Get integer conversion steps
    function getIntegerSteps(integerStr) {
        let num = parseInt(integerStr);
        if (num === 0) return '0 ÷ 2 = 0 remainder 0';
        
        let steps = '';
        let temp = num;
        while (temp > 0) {
            const remainder = temp % 2;
            const quotient = Math.floor(temp / 2);
            steps += `${temp} ÷ 2 = ${quotient} (remainder ${remainder})<br>`;
            temp = quotient;
        }
        return steps;
    }

    // Get fractional conversion steps
    function getFractionSteps(fractionalStr) {
        let fraction = parseFloat('0.' + fractionalStr);
        let steps = '';
        let stepCount = 0;
        const maxSteps = 6;
        
        while (fraction > 0 && stepCount < maxSteps) {
            fraction *= 2;
            const integerPart = Math.floor(fraction);
            steps += `${fraction.toFixed(4)} → take ${integerPart}<br>`;
            if (fraction >= 1) fraction -= 1;
            stepCount++;
        }
        
        if (fraction > 0 && stepCount >= maxSteps) {
            steps += '... (continues)';
        }
        
        return steps || '0 (exact conversion)';
    }

    // Clear input and results
    function clearInput() {
        elements.decimalInput.value = '';
        elements.decimalInput.classList.remove('valid-input', 'invalid-input');
        elements.binaryResult.textContent = "Waiting for input...";
        elements.binaryResult.className = "text-secondary fw-bold";
        elements.conversionDetails.innerHTML = '';
        elements.decimalError.textContent = '';
        currentDecimal = "";
        elements.decimalInput.focus();
    }

    // Load a random sample
    function loadRandomSample() {
        const randomIndex = Math.floor(Math.random() * sampleNumbers.length);
        const sample = sampleNumbers[randomIndex];
        
        elements.decimalInput.value = sample.decimal;
        handleInput();
        
        // Show a brief notification
        showNotification(`Loaded example: ${sample.decimal} → ${sample.binary}`);
    }

    // Load initial example
    function loadInitialExample() {
        elements.decimalInput.value = "15.625";
        setTimeout(() => {
            convertDecimalToBinary();
        }, 100);
    }

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification-toast position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded shadow fade-in';
        notification.style.zIndex = '1050';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle me-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('fade-in');
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize the app
    init();
});