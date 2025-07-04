// Utility functions
function maskPassword(pass) {
    return '•'.repeat(pass.length);
}

function showNotification(message, type = 'success') {
    const alert = document.getElementById("alert");
    const colors = {
        success: '#88ff66',
        error: '#ff5e62',
        warning: '#ffcc33',
        info: '#66b3ff'
    };
    
    alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    alert.style.display = "inline";
    alert.style.backgroundColor = colors[type] || colors.success;
    
    setTimeout(() => {
        alert.style.display = "none";
    }, 2000);
}

function copyText(txt, type) {
    let message = '';
    switch(type) {
        case 'website':
            message = 'Website copied!';
            break;
        case 'username':
            message = 'Username copied!';
            break;
        case 'password':
            message = 'Password copied!';
            break;
        default:
            message = 'Copied!';
    }

    // First try the modern Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(
            () => {
                showNotification(message);
            },
            () => {
                // If Clipboard API fails, try fallback method
                fallbackCopyText(txt, message);
            }
        );
    } else {
        // If Clipboard API not available, use fallback
        fallbackCopyText(txt, message);
    }
}

// Fallback method for copying text
function fallbackCopyText(txt, message) {
    try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = txt;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        
        // Try to execute the copy command
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showNotification(message);
        } else {
            showNotification('Copy failed! Please copy manually.', 'error');
        }
    } catch (err) {
        showNotification('Copy failed! Please copy manually.', 'error');
        console.error('Fallback copy failed:', err);
    }
}

const deletePassword = (website) => {
    if (confirm(`Are you sure you want to delete the password for ${website}?`)) {
        let data = localStorage.getItem("passwords");
        let arr = JSON.parse(data);
        let arrUpdated = arr.filter((e) => e.website !== website);
        localStorage.setItem("passwords", JSON.stringify(arrUpdated));
        showNotification(`Successfully deleted ${website}'s password`);
        showPasswords();
        
        // Add delete animation
        const table = document.querySelector("table");
        table.classList.add('shake');
        setTimeout(() => table.classList.remove('shake'), 500);
    }
};

// Create floating confetti
function createConfetti() {
    const container = document.querySelector('.confetti-container');
    const colors = [
        '#ff5e62', '#ff9966', '#ffcc33', 
        '#88ff66', '#66b3ff', '#cc99ff', '#ff99cc'
    ];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Fill the table with passwords
const showPasswords = () => {
    let tb = document.querySelector("table");
    let data = localStorage.getItem("passwords");
    
    if (!data || JSON.parse(data).length === 0) {
        tb.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #666;">No passwords saved yet. Add your first password below!</td></tr>';
    } else {
        tb.innerHTML = `
            <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Delete</th>
            </tr>`;
        
        let arr = JSON.parse(data);
        let str = "";
        
        arr.forEach((element, index) => {
            // Alternate row colors from the rainbow
            const rainbowColors = [
                'var(--rainbow-red)',
                'var(--rainbow-orange)',
                'var(--rainbow-yellow)',
                'var(--rainbow-green)',
                'var(--rainbow-blue)',
                'var(--rainbow-purple)',
                'var(--rainbow-pink)'
            ];
            const rowColor = rainbowColors[index % rainbowColors.length];
            
            str += `
                <tr style="--row-color: ${rowColor}">
                    <td>
                        ${element.website} 
                        <i class="fas fa-copy copy-icon" data-type="website" data-value="${element.website.replace(/"/g, '&quot;')}" title="Copy website"></i>
                    </td>
                    <td>
                        ${element.username} 
                        <i class="fas fa-copy copy-icon" data-type="username" data-value="${element.username.replace(/"/g, '&quot;')}" title="Copy username"></i>
                    </td>
                    <td class="password-cell">
                        <span class="password-text">${maskPassword(element.password)}</span>
                        <i class="fas fa-copy copy-icon" data-type="password" data-value="${element.password.replace(/"/g, '&quot;')}" title="Copy password"></i>
                        <i class="fas fa-eye show-password" title="Show/hide password"></i>
                    </td>
                    <td>
                        <button class="btnsm" onclick="deletePassword('${element.website.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                </tr>`;
        });
        
        tb.innerHTML += str;
        
        // Add event listeners for copy buttons
        document.querySelectorAll('.copy-icon').forEach(button => {
            button.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const value = this.getAttribute('data-value');
                copyText(value, type);
            });
        });
        
        // Add event listeners for show password buttons
        document.querySelectorAll('.show-password').forEach(button => {
            button.addEventListener('click', function() {
                const passwordCell = this.closest('.password-cell');
                const passwordText = passwordCell.querySelector('.password-text');
                const isHidden = this.classList.contains('fa-eye');
                
                if (isHidden) {
                    // Show password
                    const row = this.closest('tr');
                    const website = row.cells[0].textContent.trim();
                    const passwords = JSON.parse(localStorage.getItem("passwords"));
                    const passwordObj = passwords.find(p => p.website === website);
                    
                    if (passwordObj) {
                        passwordText.textContent = passwordObj.password;
                        this.classList.remove('fa-eye');
                        this.classList.add('fa-eye-slash');
                    }
                } else {
                    // Hide password
                    const row = this.closest('tr');
                    const website = row.cells[0].textContent.trim();
                    const passwords = JSON.parse(localStorage.getItem("passwords"));
                    const passwordObj = passwords.find(p => p.website === website);
                    
                    if (passwordObj) {
                        passwordText.textContent = maskPassword(passwordObj.password);
                        this.classList.remove('fa-eye-slash');
                        this.classList.add('fa-eye');
                    }
                }
            });
        });
    }
    
    // Reset form fields
    document.getElementById("website").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log("Rainbow Password Manager Initialized");
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });
    
    showPasswords();
    
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        
        // Add a little rainbow flash when changing themes
        document.body.style.background = `linear-gradient(90deg, 
            var(--rainbow-red), 
            var(--rainbow-orange), 
            var(--rainbow-yellow), 
            var(--rainbow-green), 
            var(--rainbow-blue), 
            var(--rainbow-purple), 
            var(--rainbow-pink))`;
        
        setTimeout(() => {
            document.body.style.background = '';
        }, 300);
    });
    
    // Form submission
    document.querySelector(".btn").addEventListener("click", (e) => {
        e.preventDefault();
        
        const website = document.getElementById("website");
        const username = document.getElementById("username");
        const password = document.getElementById("password");
        
        if (!website.value || !username.value || !password.value) {
            showNotification('Please fill all fields!', 'error');
            
            // Add shake animation to empty fields
            if (!website.value) website.classList.add('shake');
            if (!username.value) username.classList.add('shake');
            if (!password.value) password.classList.add('shake');
            
            setTimeout(() => {
                website.classList.remove('shake');
                username.classList.remove('shake');
                password.classList.remove('shake');
            }, 500);
            
            return;
        }
        
        let passwords = localStorage.getItem("passwords");
        let json = passwords ? JSON.parse(passwords) : [];
        
        // Check if website already exists
        if (json.some(item => item.website === website.value)) {
            if (confirm(`A password for ${website.value} already exists. Overwrite?`)) {
                json = json.filter(item => item.website !== website.value);
            } else {
                return;
            }
        }
        
        json.push({ 
            website: website.value, 
            username: username.value, 
            password: password.value 
        });
        
        localStorage.setItem("passwords", JSON.stringify(json));
        showNotification("Password Saved!");
        showPasswords();
        
        // Magical celebration effect
        const btn = document.querySelector(".btn");
        btn.classList.add('celebrate');
        
        // Create rainbow confetti
        createConfetti();
        
        setTimeout(() => btn.classList.remove('celebrate'), 1000);
    });
    
    // Add floating animation to form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.transform = 'translateY(-3px)';
            input.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        });
        
        input.addEventListener('blur', () => {
            input.style.transform = 'translateY(0)';
            input.style.boxShadow = 'none';
        });
    });
    
    // Add rainbow effect to table rows on hover
    document.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'TR') {
            const colors = [
                'rgba(255, 94, 98, 0.1)',
                'rgba(255, 153, 102, 0.1)',
                'rgba(255, 204, 51, 0.1)',
                'rgba(136, 255, 102, 0.1)',
                'rgba(102, 179, 255, 0.1)',
                'rgba(204, 153, 255, 0.1)',
                'rgba(255, 153, 204, 0.1)'
            ];
            e.target.style.background = colors[Math.floor(Math.random() * colors.length)];
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'TR') {
            e.target.style.background = '';
        }
    });
    
    // Add animation to hero text
    const heroText = document.querySelector('.hero p');
    setTimeout(() => {
        heroText.style.animation = 'fadeIn 1s ease';
    }, 500);
    
    // Add animation to form container
    const formContainer = document.querySelector('.form-container');
    setTimeout(() => {
        formContainer.style.animation = 'slideUp 0.8s ease';
    }, 700);
});

document.addEventListener('DOMContentLoaded', function() {
  // Update copyright year
  document.getElementById('year').textContent = new Date().getFullYear();
});