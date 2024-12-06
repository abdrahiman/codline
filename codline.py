import subprocess
import sys
import requests
SERVER="https://3000-cs-538771129696-default.cs-europe-west1-xedi.cloudshell.dev/?authuser=0&redirectedPreviously=true"

def run_command(command):
    """Run a shell command and print its output."""
    try:
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        sys.exit(1)

def git_push():
    """Automates git add, commit, and push."""
    print("Adding all changes...")
    run_command(["git", "add", "."])

    print("Committing changes...")
    run_command(["git", "commit", "-m","988"])

    print("Pushing changes to the remote repository...")
    run_command(["git", "push","origin","main"])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python room-cli.py '<command>'")
        sys.exit(1)
    link = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
    link = link.stdout.strip()
    print(link)

    command = sys.argv[1]
    if command == "init":
        res = requests.get(f"{SERVER}/init?githubLink={link}")
        print(res.text)
    elif command == "update":
        git_push()
        res = requests.get(f"{SERVER}/update?githubLink={link}")
        print(res)