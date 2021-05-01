# Card Scheduler

Specification: Take a card history and return the next due date

Incoming Object:
{
  uuid: string;
  history: [Date, boolean][]
}

A `Date` is a string of the form "Tue, 22 Nov 2011 06:00:00 GMT" (i.e. UTC Time).


Outgoing Object:
{
  uuid: string;
  dueDate: Date;
}

## Steps

1. Create a project scaffold - (feature/scheduler/scaffold)
  - venv
  - look up best practices for directory structure of Python project
    - considering unit testing, integration testing, and classes etc.

2. Create the incoming and outgoing object classes - (feature/scheduler/message-schema)
  - Use pytype https://github.com/google/pytype/blob/master/docs/user_guide.md
  - Add these interfaces to the Schema (see the `schema` directory of project root)
    - In here, you will see TypeScript Schema's for all the other objects in this project.

3. Implement a simple algorithm to convert a history to a due date - (feature/scheduler/algorithm)
  - Unit test this code (see pytest or similar - 100% test coverage - consider edge cases etc)

4. Run a docker container running Kafka
  - See `../microservices/docker-compose.yml`
    - Learn how to run this file
    - Learn how to use `docker` command to:
        - stop a container
        - start a container
        - see the logs of a container
        - get a bash shell into a container

5. Use kafkacat (CLI tool) to produce and consume messages
  - Ensure you can connect to the Kafka instance running in the Docker container.
  - Open two terminals and make one a producer and another a consumer. Ensure that your consumer sees the producers messages.

6. Add kafka-python to the project's venv and add it to the code - (feature/scheduler/kafka-integration)
  - Use Kafkacat to ensure that your program is reading the messages sent down the 'Card' Topic

7. Create a `Dockerfile` for the application and build its Docker image - (feature/scheduler/docker)
  - Run your program in a Docker image

8. Create another Python file to perform integration testing of the Card Scheduler - (feature/scheduler/integration-testing)
  - While running your program in the Docker image, run another Python project to perform integration testing of your program.
