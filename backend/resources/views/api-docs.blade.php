<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - {{ config('app.name') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #718096;
            font-size: 1.1rem;
        }
        
        .base-url {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            color: #4a5568;
            border-left: 4px solid #667eea;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            color: #718096;
            font-size: 0.9rem;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        
        .stat-card .number {
            color: #667eea;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        .routes-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .route-item {
            border-bottom: 1px solid #e2e8f0;
            transition: background-color 0.2s;
        }
        
        .route-item:hover {
            background-color: #f7fafc;
        }
        
        .route-item:last-child {
            border-bottom: none;
        }
        
        .route-header {
            padding: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .method {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.85rem;
            min-width: 80px;
            text-align: center;
            text-transform: uppercase;
        }
        
        .method-get { background: #c6f6d5; color: #22543d; }
        .method-post { background: #bee3f8; color: #2a4365; }
        .method-put { background: #fefcbf; color: #744210; }
        .method-patch { background: #feebc8; color: #7c2d12; }
        .method-delete { background: #fed7d7; color: #742a2a; }
        
        .uri {
            flex: 1;
            font-family: 'Courier New', monospace;
            color: #2d3748;
            font-size: 1rem;
        }
        
        .route-details {
            padding: 0 20px 20px 20px;
            display: none;
        }
        
        .route-item.active .route-details {
            display: block;
        }
        
        .detail-section {
            margin-top: 15px;
        }
        
        .detail-section h4 {
            color: #4a5568;
            font-size: 0.9rem;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .middleware-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .middleware-tag {
            background: #edf2f7;
            color: #4a5568;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-family: 'Courier New', monospace;
        }
        
        .action {
            color: #718096;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        
        .expand-icon {
            color: #a0aec0;
            transition: transform 0.2s;
        }
        
        .route-item.active .expand-icon {
            transform: rotate(180deg);
        }
        
        .test-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }
        
        .test-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }
        
        .test-btn:active {
            transform: translateY(0);
        }
        
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 900px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s;
        }
        
        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.3rem;
        }
        
        .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 1.5rem;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 80px);
        }
        
        .response-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        
        .status-success { background: #d1fae5; color: #065f46; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }
        
        .json-output {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #718096;
        }
        
        .loading-spinner {
            border: 4px solid #f3f4f6;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }
            
            .route-header {
                flex-wrap: wrap;
            }
            
            .uri {
                width: 100%;
                order: 3;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 API Documentation</h1>
            <p>{{ config('app.name') }} - Complete API Reference</p>
            <div class="base-url">
                <strong>Base URL:</strong> {{ url('/api') }}
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Endpoints</h3>
                <div class="number">{{ count($routes) }}</div>
            </div>
            <div class="stat-card">
                <h3>Database</h3>
                <div class="number" style="font-size: 1.2rem;">
                    <span style="color: {{ $dbStatus === 'connected' ? '#10b981' : '#ef4444' }};">
                        ● {{ ucfirst($dbConnection) }}
                    </span>
                </div>
            </div>
            <div class="stat-card">
                <h3>Users</h3>
                <div class="number">{{ $stats['total_users'] ?? 0 }}</div>
            </div>
            <div class="stat-card">
                <h3>Doctors</h3>
                <div class="number">{{ $stats['total_doctors'] ?? 0 }}</div>
            </div>
            <div class="stat-card">
                <h3>Appointments</h3>
                <div class="number">{{ $stats['total_appointments'] ?? 0 }}</div>
            </div>
        </div>
        
        <!-- Live Data Section -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <!-- Sample Doctors -->
            <div class="routes-container">
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h3 style="margin: 0; font-size: 1.2rem;">👨‍⚕️ Sample Doctors</h3>
                </div>
                <div style="padding: 15px;">
                    @forelse($sampleDoctors as $doctor)
                    <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <div style="font-weight: bold; color: #2d3748;">{{ $doctor['name'] }}</div>
                        <div style="color: #718096; font-size: 0.9rem; margin-top: 4px;">
                            <span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">{{ $doctor['specialty'] }}</span>
                        </div>
                        <div style="color: #4a5568; font-size: 0.85rem; margin-top: 6px;">
                            💰 €{{ $doctor['fee'] }} | ⭐ {{ $doctor['experience'] }} years exp.
                        </div>
                    </div>
                    @empty
                    <div style="padding: 20px; text-align: center; color: #a0aec0;">
                        No doctors found
                    </div>
                    @endforelse
                </div>
            </div>
            
            <!-- Recent Appointments -->
            <div class="routes-container">
                <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                    <h3 style="margin: 0; font-size: 1.2rem;">📅 Recent Appointments</h3>
                </div>
                <div style="padding: 15px;">
                    @forelse($recentAppointments as $appointment)
                    <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <div style="font-weight: bold; color: #2d3748;">
                            {{ $appointment['patient'] }} → {{ $appointment['doctor'] }}
                        </div>
                        <div style="color: #718096; font-size: 0.85rem; margin-top: 4px;">
                            📆 {{ $appointment['date'] }} at {{ $appointment['time'] }}
                        </div>
                        <div style="margin-top: 6px;">
                            @php
                                $statusColors = [
                                    'pending' => '#fef3c7',
                                    'confirmed' => '#dbeafe',
                                    'completed' => '#d1fae5',
                                    'cancelled' => '#fee2e2'
                                ];
                                $textColors = [
                                    'pending' => '#92400e',
                                    'confirmed' => '#1e40af',
                                    'completed' => '#065f46',
                                    'cancelled' => '#991b1b'
                                ];
                                $bgColor = $statusColors[$appointment['status']] ?? '#f3f4f6';
                                $textColor = $textColors[$appointment['status']] ?? '#374151';
                            @endphp
                            <span style="background: {{ $bgColor }}; color: {{ $textColor }}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: bold;">
                                {{ $appointment['status'] }}
                            </span>
                        </div>
                    </div>
                    @empty
                    <div style="padding: 20px; text-align: center; color: #a0aec0;">
                        No appointments yet
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
        
        <div class="routes-container">
            @forelse($routes as $route)
            <div class="route-item" onclick="this.classList.toggle('active')">
                <div class="route-header">
                    @php
                        $methodClass = 'method-' . strtolower(explode('|', $route['method'])[0]);
                    @endphp
                    <span class="method {{ $methodClass }}">{{ $route['method'] }}</span>
                    <span class="uri">{{ $route['uri'] }}</span>
                    <button class="test-btn" onclick="event.stopPropagation(); testEndpoint('{{ $route['uri'] }}', '{{ explode('|', $route['method'])[0] }}')">
                         Test
                    </button>
                    <svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="route-details">
                    @if($route['action'])
                    <div class="detail-section">
                        <h4>Controller Action</h4>
                        <div class="action">{{ $route['action'] }}</div>
                    </div>
                    @endif
                    
                    @if(!empty($route['middleware']))
                    <div class="detail-section">
                        <h4>Middleware</h4>
                        <div class="middleware-list">
                            @foreach($route['middleware'] as $middleware)
                                <span class="middleware-tag">{{ $middleware }}</span>
                            @endforeach
                        </div>
                    </div>
                    @endif
                    
                    @if($route['name'])
                    <div class="detail-section">
                        <h4>Route Name</h4>
                        <div class="action">{{ $route['name'] }}</div>
                    </div>
                    @endif
                </div>
            </div>
            @empty
            <div style="padding: 40px; text-align: center; color: #718096;">
                <p>No API routes found.</p>
            </div>
            @endforelse
        </div>
    </div>
    
    <!-- Modal for API Response -->
    <div id="apiModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">API Response</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="modalLoading" class="loading">
                    <div class="loading-spinner"></div>
                    <p>Fetching live data...</p>
                </div>
                <div id="modalResponse" style="display: none;">
                    <div id="statusBadge" class="response-status"></div>
                    <div class="json-output" id="jsonData"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Add click handler for better UX
        document.querySelectorAll('.route-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.route-header')) {
                    this.classList.toggle('active');
                }
            });
        });
        
        // Test endpoint function
        function testEndpoint(uri, method) {
            const modal = document.getElementById('apiModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalLoading = document.getElementById('modalLoading');
            const modalResponse = document.getElementById('modalResponse');
            const statusBadge = document.getElementById('statusBadge');
            const jsonData = document.getElementById('jsonData');
            
            // Show modal
            modal.classList.add('active');
            modalTitle.textContent = `${method} ${uri}`;
            modalLoading.style.display = 'block';
            modalResponse.style.display = 'none';
            
            // Make AJAX request
            fetch('{{ route("api.test") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({
                    uri: uri,
                    method: method
                })
            })
            .then(response => response.json())
            .then(data => {
                modalLoading.style.display = 'none';
                modalResponse.style.display = 'block';
                
                // Set status badge
                const status = data.status || 500;
                statusBadge.textContent = `Status: ${status}`;
                
                if (status >= 200 && status < 300) {
                    statusBadge.className = 'response-status status-success';
                } else if (status >= 400 && status < 500) {
                    statusBadge.className = 'response-status status-warning';
                } else {
                    statusBadge.className = 'response-status status-error';
                }
                
                // Display JSON with syntax highlighting
                const jsonString = JSON.stringify(data.data || data.error, null, 2);
                jsonData.innerHTML = syntaxHighlight(jsonString);
            })
            .catch(error => {
                modalLoading.style.display = 'none';
                modalResponse.style.display = 'block';
                statusBadge.textContent = 'Error';
                statusBadge.className = 'response-status status-error';
                jsonData.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
            });
        }
        
        // Close modal function
        function closeModal() {
            document.getElementById('apiModal').classList.remove('active');
        }
        
        // Close modal when clicking outside
        document.getElementById('apiModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Syntax highlight JSON
        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'color: #7dd3fc;'; // number
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'color: #93c5fd; font-weight: bold;'; // key
                    } else {
                        cls = 'color: #86efac;'; // string
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'color: #fbbf24;'; // boolean
                } else if (/null/.test(match)) {
                    cls = 'color: #f87171;'; // null
                }
                return '<span style="' + cls + '">' + match + '</span>';
            });
        }
    </script>
</body>
</html>
