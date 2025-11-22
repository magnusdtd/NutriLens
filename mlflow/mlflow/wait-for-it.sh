#!/usr/bin/env bash
# Use this script to test if a given TCP host/port are available
# This is commonly used in Docker containers to wait for dependent services
# (like databases) to be ready before starting the main application

# Extract the script name from the full path for use in messages
WAITFORIT_cmdname=${0##*/}

# Function to output error messages to stderr only if not in quiet mode
echoerr() { if [[ $WAITFORIT_QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

# Display usage information and available command-line options
usage()
{
    cat << USAGE >&2
Usage:
    $WAITFORIT_cmdname host:port [-s] [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP under test
    -p PORT | --port=PORT       TCP port under test
                                Alternatively, you specify the host and port as host:port
    -s | --strict               Only execute subcommand if the test succeeds
    -q | --quiet                Don't output any status messages
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for no timeout
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

# Core function that performs the actual waiting/polling for host:port availability
wait_for()
{
    # Display appropriate waiting message based on timeout setting
    if [[ $WAITFORIT_TIMEOUT -gt 0 ]]; then
        echoerr "$WAITFORIT_cmdname: waiting $WAITFORIT_TIMEOUT seconds for $WAITFORIT_HOST:$WAITFORIT_PORT"
    else
        echoerr "$WAITFORIT_cmdname: waiting for $WAITFORIT_HOST:$WAITFORIT_PORT without a timeout"
    fi
    
    # Record the start time for duration calculation
    WAITFORIT_start_ts=$(date +%s)
    
    # Infinite loop to keep checking until connection is available
    while :
    do
        # Choose connection test method based on busybox detection
        if [[ $WAITFORIT_ISBUSY -eq 1 ]]; then
            # Use netcat for busybox environments (Alpine Linux containers)
            nc -z $WAITFORIT_HOST $WAITFORIT_PORT
            WAITFORIT_result=$?
        else
            # Use bash's built-in TCP connection test for standard environments
            (echo -n > /dev/tcp/$WAITFORIT_HOST/$WAITFORIT_PORT) >/dev/null 2>&1
            WAITFORIT_result=$?
        fi
        
        # If connection successful (exit code 0), break out of loop
        if [[ $WAITFORIT_result -eq 0 ]]; then
            WAITFORIT_end_ts=$(date +%s)
            echoerr "$WAITFORIT_cmdname: $WAITFORIT_HOST:$WAITFORIT_PORT is available after $((WAITFORIT_end_ts - WAITFORIT_start_ts)) seconds"
            break
        fi
        
        # Wait 1 second before trying again
        sleep 1
    done
    return $WAITFORIT_result
}

# Wrapper function that handles timeout functionality by spawning a child process
wait_for_wrapper()
{
    # Handle SIGINT during timeout using background process approach
    # Reference: http://unix.stackexchange.com/a/57692
    
    # Start the wait_for function as a child process with timeout
    if [[ $WAITFORIT_QUIET -eq 1 ]]; then
        # Quiet mode: suppress output from child process
        timeout $WAITFORIT_BUSYTIMEFLAG $WAITFORIT_TIMEOUT $0 --quiet --child --host=$WAITFORIT_HOST --port=$WAITFORIT_PORT --timeout=$WAITFORIT_TIMEOUT &
    else
        # Normal mode: allow output from child process
        timeout $WAITFORIT_BUSYTIMEFLAG $WAITFORIT_TIMEOUT $0 --child --host=$WAITFORIT_HOST --port=$WAITFORIT_PORT --timeout=$WAITFORIT_TIMEOUT &
    fi
    
    # Store the process ID of the background timeout process
    WAITFORIT_PID=$!
    
    # Set up signal handler to forward SIGINT to the child process
    trap "kill -INT -$WAITFORIT_PID" INT
    
    # Wait for the background process to complete
    wait $WAITFORIT_PID
    WAITFORIT_RESULT=$?
    
    # Report timeout if the process failed
    if [[ $WAITFORIT_RESULT -ne 0 ]]; then
        echoerr "$WAITFORIT_cmdname: timeout occurred after waiting $WAITFORIT_TIMEOUT seconds for $WAITFORIT_HOST:$WAITFORIT_PORT"
    fi
    return $WAITFORIT_RESULT
}

# Parse command-line arguments using a while loop
# Supports various formats: host:port, separate -h/-p flags, and other options
while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        # Parse host:port format (e.g., "localhost:5432")
        WAITFORIT_hostport=(${1//:/ })
        WAITFORIT_HOST=${WAITFORIT_hostport[0]}
        WAITFORIT_PORT=${WAITFORIT_hostport[1]}
        shift 1
        ;;
        --child)
        # Internal flag used for recursive calls with timeout
        WAITFORIT_CHILD=1
        shift 1
        ;;
        -q | --quiet)
        # Suppress all status messages
        WAITFORIT_QUIET=1
        shift 1
        ;;
        -s | --strict)
        # Only execute subcommand if connection test succeeds
        WAITFORIT_STRICT=1
        shift 1
        ;;
        -h)
        # Host specified with separate flag
        WAITFORIT_HOST="$2"
        if [[ $WAITFORIT_HOST == "" ]]; then break; fi
        shift 2
        ;;
        --host=*)
        # Host specified with equals sign format
        WAITFORIT_HOST="${1#*=}"
        shift 1
        ;;
        -p)
        # Port specified with separate flag
        WAITFORIT_PORT="$2"
        if [[ $WAITFORIT_PORT == "" ]]; then break; fi
        shift 2
        ;;
        --port=*)
        # Port specified with equals sign format
        WAITFORIT_PORT="${1#*=}"
        shift 1
        ;;
        -t)
        # Timeout specified with separate flag
        WAITFORIT_TIMEOUT="$2"
        if [[ $WAITFORIT_TIMEOUT == "" ]]; then break; fi
        shift 2
        ;;
        --timeout=*)
        # Timeout specified with equals sign format
        WAITFORIT_TIMEOUT="${1#*=}"
        shift 1
        ;;
        --)
        # Everything after -- is treated as a command to execute
        shift
        WAITFORIT_CLI=("$@")
        break
        ;;
        --help)
        # Display usage information
        usage
        ;;
        *)
        # Unknown argument
        echoerr "Unknown argument: $1"
        usage
        ;;
    esac
done

# Validate that both host and port have been provided
if [[ "$WAITFORIT_HOST" == "" || "$WAITFORIT_PORT" == "" ]]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

# Set default values for optional parameters
WAITFORIT_TIMEOUT=${WAITFORIT_TIMEOUT:-15}    # Default timeout: 15 seconds
WAITFORIT_STRICT=${WAITFORIT_STRICT:-0}       # Default: not strict mode
WAITFORIT_CHILD=${WAITFORIT_CHILD:-0}         # Default: not a child process
WAITFORIT_QUIET=${WAITFORIT_QUIET:-0}         # Default: not quiet mode

# Detect if we're running in a busybox environment (common in Alpine Linux containers)
# This affects which tools are available for network connectivity testing
WAITFORIT_TIMEOUT_PATH=$(type -p timeout)
WAITFORIT_TIMEOUT_PATH=$(realpath $WAITFORIT_TIMEOUT_PATH 2>/dev/null || readlink -f $WAITFORIT_TIMEOUT_PATH)

# Initialize busybox-specific variables
WAITFORIT_BUSYTIMEFLAG=""
if [[ $WAITFORIT_TIMEOUT_PATH =~ "busybox" ]]; then
    WAITFORIT_ISBUSY=1
    # Check if busybox timeout supports -t flag
    # Recent Alpine versions don't support -t flag anymore
    if timeout &>/dev/stdout | grep -q -e '-t '; then
        WAITFORIT_BUSYTIMEFLAG="-t"
    fi
else
    # Standard Linux environment (not busybox)
    WAITFORIT_ISBUSY=0
fi

# Main execution logic: choose between child process mode or wrapper mode
if [[ $WAITFORIT_CHILD -gt 0 ]]; then
    # Child process mode: called recursively by wait_for_wrapper with timeout
    wait_for
    WAITFORIT_RESULT=$?
    exit $WAITFORIT_RESULT
else
    # Parent process mode: decide whether to use timeout wrapper
    if [[ $WAITFORIT_TIMEOUT -gt 0 ]]; then
        # Use timeout wrapper for finite timeout
        wait_for_wrapper
        WAITFORIT_RESULT=$?
    else
        # No timeout: wait indefinitely
        wait_for
        WAITFORIT_RESULT=$?
    fi
fi

# Execute additional command if provided (after -- in command line)
if [[ $WAITFORIT_CLI != "" ]]; then
    # Check strict mode: only execute if connection test succeeded
    if [[ $WAITFORIT_RESULT -ne 0 && $WAITFORIT_STRICT -eq 1 ]]; then
        echoerr "$WAITFORIT_cmdname: strict mode, refusing to execute subprocess"
        exit $WAITFORIT_RESULT
    fi
    # Execute the command passed after --
    exec "${WAITFORIT_CLI[@]}"
else
    # No additional command: exit with the result of the connection test
    exit $WAITFORIT_RESULT
fi