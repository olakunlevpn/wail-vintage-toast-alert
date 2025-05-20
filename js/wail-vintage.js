/**
 * Wail Vintage Toast Alert v1.0.0
 * A vintage jQuery UI based notification library
 * 
 * Copyright (c) 2025 Maylancer IT Limited
 * @author Olakunlevpn
 * @email olakunlevpn@gmail.com
 * @github https://github.com/olakunlevpn/wail-vintage-toast-alert
 * Released under the MIT License
 * 
 * Requires: jQuery v1.8+ and jQuery UI v1.8+
 */

(function($) {
    "use strict";
    
    // Default configuration
    var defaults = {
        message: '',                 // Notification message
        title: '',                   // Notification title (optional)
        type: 'default',             // Type: default, success, error, warning, info
        position: 'bottom-right',    // Position: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
        duration: 5000,              // Duration in milliseconds (0 for sticky)
        showHeader: true,            // Whether to show the header section
        showClose: true,             // Show close button
        width: 300,                  // Width in pixels
        zIndex: 9999,                // z-index for notifications
        onOpen: null,                // Callback when notification is opened
        onClose: null,               // Callback when notification is closed
        onClick: null,               // Callback when notification is clicked
        onHover: null,               // Callback when notification is hovered
        pauseOnHover: true,          // Pause auto-close timer when hovering
        escapeHtml: true,            // Escape HTML in message and title
        closeOnClick: false,         // Close notification when clicked
        stack: 5                     // Maximum number of notifications to show at once (0 for unlimited)
    };
    
    // Container for notifications
    function getContainer(position, zIndex) {
        var containerId = 'wail-container-' + position;
        var $container = $('#' + containerId);
        
        if ($container.length === 0) {
            $container = $('<div id="' + containerId + '" class="wail-container"></div>')
                .css('z-index', zIndex)
                .appendTo('body');
        }
        
        // Position the container
        var css = { position: 'fixed', width: 'auto' };
        
        // Handle vertical position
        if (position.indexOf('top') !== -1) {
            css.top = '20px';
            css.bottom = 'auto';
        } else {
            css.bottom = '20px';
            css.top = 'auto';
        }
        
        // Handle horizontal position
        if (position.indexOf('left') !== -1) {
            css.left = '20px';
            css.right = 'auto';
            css.transform = 'none';
        } else if (position.indexOf('right') !== -1) {
            css.right = '20px';
            css.left = 'auto';
            css.transform = 'none';
        } else if (position.indexOf('center') !== -1) {
            css.left = '50%';
            css.right = 'auto';
            css.transform = 'translateX(-50%)';
        }
        
        $container.css(css);
        
        return $container;
    }
    
    // Escape HTML
    function escapeHtml(text) {
        if (typeof text !== 'string') {
            return text;
        }
        
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Create notification element
    function createWail(options) {
        var $wail = $('<div></div>')
            .addClass('wail wail-' + options.type)
            .css({
                'width': options.width + 'px',
                'display': 'none'
            });
        
        // Process message and title
        var message = options.escapeHtml ? escapeHtml(options.message) : options.message;
        var title = options.title;
        if (options.escapeHtml && title) {
            title = escapeHtml(title);
        }
        
        // Add header if needed
        if (options.showHeader) {
            var $header = $('<div></div>')
                .addClass('wail-header');
            
            var $title = $('<div></div>')
                .addClass('wail-title');
            
            // Add title icon with visible content
            var iconHtml = '';
            switch(options.type) {
                case 'success':
                    iconHtml = '<span class="wail-title-icon">✓</span>';
                    break;
                case 'error':
                    iconHtml = '<span class="wail-title-icon">✗</span>';
                    break;
                case 'warning':
                    iconHtml = '<span class="wail-title-icon">!</span>';
                    break;
                case 'info':
                    iconHtml = '<span class="wail-title-icon">i</span>';
                    break;
                default:
                    iconHtml = '<span class="wail-title-icon">•</span>';
                    break;
            }
            $title.append(iconHtml);
            
            // Add title text
            if (title) {
                $title.append('<span>' + title + '</span>');
            } else {
                // Default titles
                var defaultTitle = 'Notification';
                switch(options.type) {
                    case 'success': defaultTitle = 'Success'; break;
                    case 'error': defaultTitle = 'Error'; break;
                    case 'warning': defaultTitle = 'Warning'; break;
                    case 'info': defaultTitle = 'Information'; break;
                }
                $title.append('<span>' + defaultTitle + '</span>');
            }
            
            $header.append($title);
            
            // Add close button
            if (options.showClose) {
                var $close = $('<span></span>')
                    .addClass('wail-close')
                    .html('×')
                    .css({
                        'font-size': '14px',
                        'font-weight': 'bold',
                        'color': '#000000',
                        'text-align': 'center',
                        'line-height': '16px'
                    })
                    .on('click', function(e) {
                        e.stopPropagation();
                        closeWail($wail);
                    });
                
                $header.append($close);
            }
            
            $wail.append($header);
        }
        
        // Add content
        var $content = $('<div></div>')
            .addClass('wail-content')
            .html(message);
        
        // If no header but we need a close button
        if (!options.showHeader && options.showClose) {
            var $close = $('<span></span>')
                .addClass('wail-close')
                .html('×')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'right': '5px',
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'color': '#000000',
                    'text-align': 'center',
                    'line-height': '16px'
                })
                .on('click', function(e) {
                    e.stopPropagation();
                    closeWail($wail);
                });
            
            $wail.append($close);
        }
        
        $wail.append($content);
        
        // Add event handlers
        if (options.closeOnClick) {
            $wail.on('click', function() {
                closeWail($wail);
            });
        }
        
        if (options.onClick) {
            $wail.on('click', function(e) {
                options.onClick.call($wail, e);
            });
        }
        
        if (options.onHover || options.pauseOnHover) {
            $wail.on({
                mouseenter: function(e) {
                    if (options.pauseOnHover && $wail.data('timeoutId')) {
                        clearTimeout($wail.data('timeoutId'));
                        $wail.removeData('timeoutId');
                    }
                    
                    if (options.onHover) {
                        options.onHover.call($wail, e);
                    }
                },
                mouseleave: function() {
                    if (options.pauseOnHover && options.duration > 0) {
                        var timeoutId = setTimeout(function() {
                            closeWail($wail);
                        }, options.duration);
                        
                        $wail.data('timeoutId', timeoutId);
                    }
                }
            });
        }
        
        return $wail;
    }
    
    // Show notification
    function showWail(options) {
        // Merge options with defaults
        var settings = $.extend({}, defaults, options);
        
        // Get container
        var $container = getContainer(settings.position, settings.zIndex);
        
        // Check stack limit
        if (settings.stack > 0) {
            var $existingWails = $container.children('.wail');
            if ($existingWails.length >= settings.stack) {
                // Remove oldest notification
                closeWail($existingWails.first());
            }
        }
        
        // Create notification
        var $wail = createWail(settings);
        
        // Add to container
        $container.append($wail);
        
        // Show notification with animation
        $wail.fadeIn(300, function() {
            // Call onOpen callback if provided
            if (typeof settings.onOpen === 'function') {
                settings.onOpen.call($wail);
            }
        });
        
        // Auto close after duration
        if (settings.duration > 0) {
            var timeoutId = setTimeout(function() {
                closeWail($wail);
            }, settings.duration);
            
            if (settings.pauseOnHover) {
                $wail.data('timeoutId', timeoutId);
            }
        }
        
        return $wail;
    }
    
    // Close notification
    function closeWail($wail) {
        // Clear any existing timeout
        if ($wail.data('timeoutId')) {
            clearTimeout($wail.data('timeoutId'));
            $wail.removeData('timeoutId');
        }
        
        // Get the onClose callback if it exists
        var onClose = $wail.data('onClose');
        
        // Fade out and remove
        $wail.fadeOut(300, function() {
            // Call onClose callback if provided
            if (typeof onClose === 'function') {
                onClose.call($wail);
            }
            
            // Remove the notification
            $(this).remove();
            
            // Get the container
            var $container = $(this).parent('.wail-container');
            
            // Remove container if empty
            if ($container.length && $container.children().length === 0) {
                $container.remove();
            }
        });
    }
    
    // Main wail function
    $.wail = function(message, title, options) {
        // Handle different parameter combinations
        if (typeof message === 'object') {
            // If first parameter is an object, treat it as options
            options = message;
        } else if (typeof title === 'object') {
            // If message is string and title is object, treat title as options
            options = title;
            options.message = message;
        } else if (typeof message === 'string') {
            // If message is string and title is string or undefined
            options = options || {};
            options.message = message;
            if (typeof title === 'string') {
                options.title = title;
            }
        }
        
        // If options is still undefined, create an empty object
        if (!options) {
            options = {};
        }
        // Store onClose callback for later use
        if (options.onClose) {
            var $wail = showWail(options);
            $wail.data('onClose', options.onClose);
            return $wail;
        }
        
        return showWail(options);
    };
    
    // Helper methods for different types
    $.wail.success = function(message, title, options) {
        options = options || {};
        options.type = 'success';
        return $.wail(message, title || 'Success', options);
    };
    
    $.wail.error = function(message, title, options) {
        options = options || {};
        options.type = 'error';
        return $.wail(message, title || 'Error', options);
    };
    
    $.wail.warning = function(message, title, options) {
        options = options || {};
        options.type = 'warning';
        return $.wail(message, title || 'Warning', options);
    };
    
    $.wail.info = function(message, title, options) {
        options = options || {};
        options.type = 'info';
        return $.wail(message, title || 'Information', options);
    };
    
    // Clear all notifications
    $.wail.clear = function() {
        // Remove all wail containers
        $('.wail-container').remove();
    };
    
    // Version information
    $.wail.version = '1.0.0';
    
})(jQuery);
