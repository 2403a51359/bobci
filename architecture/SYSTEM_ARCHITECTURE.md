# 🏗️ BobCI System Architecture

## Overview

BobCI is an enterprise-grade AI-powered Pull Request Intelligence System that leverages IBM Bob and watsonx.ai to provide autonomous code review, security scanning, and developer mentoring.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "External Systems"
        GH[GitHub Repository]
        DEV[Developer]
    end
    
    subgraph "BobCI Platform"
        subgraph "Frontend Layer"
            UI[Next.js UI]
            COMP[React Components]
            VIZ[Visualizations]
        end
        
        subgraph "API Layer"
            API[FastAPI Backend]
            WH[Webhook Handler]
            AUTH[Authentication]
        end
        
        subgraph "AI Orchestration Layer"
            ORCH[Agent Orchestrator]
            BOB[IBM Bob Shell]
            WX[watsonx.ai Granite]
        end
        
        subgraph "Multi-Agent System"
            SA[Security Agent]
            IA[Impact Agent]
            TA[Testing Agent]
            DA[Docs Agent]
            MA[Mentor Agent]
            RA[Risk Agent]
            PA[Prediction Agent]
        end
        
        subgraph "Data Layer"
            DB[(SQLite/PostgreSQL)]
            CACHE[Analysis Cache]
        end
    end
    
    DEV -->|Opens PR| GH
    GH -->|Webhook Event| WH
    WH --> API
    API --> ORCH
    ORCH --> BOB
    ORCH --> WX
    BOB --> SA
    BOB --> IA
    BOB --> TA
    BOB --> DA
    BOB --> MA
    BOB --> RA
    BOB --> PA
    WX --> MA
    SA --> DB
    IA --> DB
    TA --> DB
    DA --> DB
    MA --> DB
    RA --> DB
    PA --> DB
    DB --> API
    API --> UI
    UI --> DEV
    API -->|Post Comment| GH
    
    style BOB fill:#0f62fe
    style WX fill:#8a3ffc
    style ORCH fill:#0043ce
    style UI fill:#24a148
```

---

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend (Next.js)"
        P[Pages]
        C[Components]
        L[API Client]
        S[State Management]
    end
    
    subgraph "Backend (FastAPI)"
        R[REST API]
        W[Webhook Handler]
        M[Models]
        D[Database Layer]
    end
    
    subgraph "AI Engine"
        B[Bob Analyzer]
        WA[Watsonx Client]
        AG[Agent System]
    end
    
    subgraph "External"
        GH[GitHub API]
        WX[watsonx.ai]
        BS[Bob Shell]
    end
    
    P --> C
    C --> L
    L --> R
    R --> W
    R --> M
    M --> D
    W --> B
    B --> AG
    B --> BS
    AG --> WA
    WA --> WX
    R --> GH
    
    style B fill:#0f62fe
    style WA fill:#8a3ffc
    style AG fill:#0043ce
```

---

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant WH as Webhook Handler
    participant Orch as Orchestrator
    participant Bob as IBM Bob
    participant WX as watsonx.ai
    participant Agents as Multi-Agents
    participant DB as Database
    participant UI as Frontend
    
    Dev->>GH: Opens Pull Request
    GH->>WH: Webhook Event
    WH->>Orch: Trigger Analysis
    Orch->>Bob: Analyze Repository
    Bob->>Bob: Understand Context
    Orch->>Agents: Distribute Tasks
    
    par Security Analysis
        Agents->>Bob: Security Scan
        Bob-->>Agents: Vulnerabilities
    and Impact Analysis
        Agents->>Bob: Impact Assessment
        Bob-->>Agents: Affected Files
    and Test Generation
        Agents->>Bob: Generate Tests
        Bob-->>Agents: Test Cases
    and Documentation
        Agents->>WX: Generate Docs
        WX-->>Agents: Documentation
    and Mentoring
        Agents->>WX: Junior Guide
        WX-->>Agents: Explanations
    end
    
    Agents->>DB: Store Results
    DB->>UI: Fetch Analysis
    UI->>Dev: Display Results
    Orch->>GH: Post Comments
    GH->>Dev: Notification
```

---

## Multi-Agent Orchestration

```mermaid
graph TD
    PR[Pull Request Event] --> ORCH[Agent Orchestrator]
    
    ORCH --> SA[Security Agent]
    ORCH --> IA[Impact Agent]
    ORCH --> TA[Testing Agent]
    ORCH --> DA[Documentation Agent]
    ORCH --> MA[Mentor Agent]
    ORCH --> RA[Risk Agent]
    ORCH --> PA[Prediction Agent]
    
    SA -->|Vulnerabilities| AGG[Result Aggregator]
    IA -->|Impact Radius| AGG
    TA -->|Test Cases| AGG
    DA -->|Documentation| AGG
    MA -->|Junior Guide| AGG
    RA -->|Risk Score| AGG
    PA -->|Failure Predictions| AGG
    
    AGG --> REPORT[Comprehensive Report]
    REPORT --> GH[GitHub Comment]
    REPORT --> UI[Dashboard UI]
    
    style ORCH fill:#0043ce
    style AGG fill:#24a148
    style REPORT fill:#8a3ffc
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Input Validation"
            WV[Webhook Verification]
            IV[Input Sanitization]
            RV[Request Validation]
        end
        
        subgraph "Authentication"
            GHT[GitHub Token]
            WXK[watsonx API Key]
            WHS[Webhook Secret]
        end
        
        subgraph "Data Protection"
            ENV[Environment Variables]
            ENC[Encryption at Rest]
            SEC[Secrets Management]
        end
        
        subgraph "Analysis Security"
            SCAN[Security Scanner]
            VULN[Vulnerability Detection]
            COMP[Compliance Check]
        end
    end
    
    WV --> IV
    IV --> RV
    GHT --> ENV
    WXK --> ENV
    WHS --> ENV
    ENV --> SEC
    RV --> SCAN
    SCAN --> VULN
    VULN --> COMP
    
    style SCAN fill:#da1e28
    style VULN fill:#fa4d56
    style COMP fill:#ff832b
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Frontend"
            NEXT[Next.js App]
            CDN[CDN/Vercel]
        end
        
        subgraph "Backend"
            API[FastAPI Server]
            WORKER[Background Workers]
        end
        
        subgraph "AI Services"
            BOB[Bob Shell]
            WX[watsonx.ai API]
        end
        
        subgraph "Data"
            PG[(PostgreSQL)]
            REDIS[(Redis Cache)]
        end
        
        subgraph "Monitoring"
            LOG[Logging]
            METRIC[Metrics]
            ALERT[Alerts]
        end
    end
    
    CDN --> NEXT
    NEXT --> API
    API --> WORKER
    WORKER --> BOB
    WORKER --> WX
    API --> PG
    API --> REDIS
    API --> LOG
    LOG --> METRIC
    METRIC --> ALERT
    
    style BOB fill:#0f62fe
    style WX fill:#8a3ffc
    style PG fill:#0043ce
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Visualizations**: React Flow, Recharts
- **State**: React Hooks
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **ORM**: SQLAlchemy
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Async**: asyncio, BackgroundTasks
- **Validation**: Pydantic

### AI/ML
- **IBM Bob**: Repository intelligence & code analysis
- **watsonx.ai**: Granite 13B Chat v2 model
- **Multi-Agent**: Custom orchestration system

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer ready
- Database connection pooling
- Redis for session management

### Performance Optimization
- Async request handling
- Background task processing
- Response caching
- CDN for static assets

### High Availability
- Multi-region deployment
- Database replication
- Automatic failover
- Health check endpoints

---

## Security Best Practices

1. **Authentication**: Token-based GitHub authentication
2. **Authorization**: Webhook signature verification
3. **Encryption**: HTTPS only, encrypted secrets
4. **Input Validation**: Pydantic models, sanitization
5. **Rate Limiting**: API throttling (planned)
6. **Audit Logging**: All security events logged
7. **Secrets Management**: Environment variables, no hardcoding

---

## Future Enhancements

1. **Kubernetes Deployment**: Container orchestration
2. **GraphQL API**: Flexible data querying
3. **Real-time Updates**: WebSocket support
4. **Advanced Analytics**: ML-powered insights
5. **Custom Models**: Fine-tuned for specific repos
6. **Team Collaboration**: Multi-user support
7. **Integration Hub**: Slack, Teams, Jira

---

*Architecture designed for enterprise-grade scalability and reliability*