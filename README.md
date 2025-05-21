# Quiz Application

A web-based application for creating and taking quizzes with a MongoDB backend.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

## Setup and Run Instructions

Follow these steps to set up and run the Quiz Application:

### 1. Clone the Repository

Clone this repository to your local machine or download and extract the source code.

### 2. Prepare Quiz Data Files

Before running the application, you need to prepare your quiz data files:

1. Create a `data` directory in the project root if it doesn't exist:
   ```
   mkdir data
   ```

2. Place your quiz data JSON files in the `data` directory.

#### Required JSON File Naming Format

Quiz data files must follow this specific naming convention:
```
Title_Type_Vendor_Year.json
```

For example:
- `CISSP_MockExam_PocketPrep_2024.json`
- `AWS_AllQuestions_CloudGuru_2025.json`

This naming format is critical for proper metadata extraction during import.

#### JSON File Structure

Each JSON file should have the following structure:
```json
{
  "questions": [
    {
      "question": "What is the question text?",
      "choices": [
        {
          "id": "a",
          "text": "First option",
          "isCorrect": false
        },
        {
          "id": "b",
          "text": "Second option",
          "isCorrect": true
        },
        ...
      ],
      "correctAnswerId": "b",
      "explanation": "Explanation text for the correct answer"
    },
    ...
  ]
}
```

### 3. Clean Up Previous Containers (If Any)

If you've previously run the application, clean up existing containers:

```bash
# Stop and remove any existing containers
docker-compose down --remove-orphans

# Remove any container with the same name if it exists
docker stop quiz-app quiz-app-mongodb 2>/dev/null
docker rm quiz-app quiz-app-mongodb 2>/dev/null
```

### 4. Start the Application

Build and start the containers with a single command:

```bash
docker-compose up --build
```

This will:
1. Build the Node.js application container
2. Start a MongoDB container for the database
3. Connect the containers via a Docker network
4. Import your quiz data from the JSON files
5. Start the application server

### 5. Access the Application

Once the containers are running, access the application in your web browser:

```
http://localhost
```

The application is mapped to port 80, so you can access it without specifying a port.

## Data Import Process

The application automatically imports quiz data when the container starts. Here's what happens:

1. MongoDB starts and creates a database
2. The application waits for MongoDB to be ready
3. The import script (`npm run import`) runs automatically
4. Each JSON file in the `data` directory is processed:
   - File name is parsed to extract metadata (Title, Type, Vendor, Year)
   - Questions are imported into MongoDB with the extracted metadata
   - Special entries for "Flagged Questions" and "Missed Questions" are created

You'll see import progress in the console logs.

## Managing the Application

### Stopping the Application

To stop the application while preserving data:

```bash
docker-compose down
```

### Completely Removing the Application

To stop the application and remove all data:

```bash
docker-compose down -v
```

This removes all containers, networks, and volumes, effectively deleting all database data.

### Viewing Logs

To view application logs:

```bash
docker-compose logs -f app
```

To view MongoDB logs:

```bash
docker-compose logs -f mongodb
```

## Troubleshooting

### Import Failures

If data import fails:

1. Check your JSON files for proper formatting
2. Ensure the files follow the required naming convention
3. Verify the `data` directory is mounted correctly

### Connection Issues

If the application can't connect to MongoDB:

1. Ensure both containers are running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify the connection string in the app's environment variables

### Port Conflicts

If port 80 is already in use on your machine, modify the `docker-compose.yml` file to use a different port:

```yaml
ports:
  - "8080:5000"  # Change 80 to another port, like 8080
```

Then access the application at `http://localhost:8080`.
