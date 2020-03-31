#!/bin/bash


usage() {
    cat <<EOF
NAME
    ${0##*/} This gets the latest commits from the master-repository of this fork

SYNOPSIS
    ${0##*/}

Options:

    For example:
        ./rebase_fork.sh

RETURN CODES
    Returns 0 on success, 1 if an error occurs.

SEE ALSO
    See the documentation on Confluence for more details, including
    instructions on creating environments.

EOF
}


function rebase() {
	git remote add forked-upstream https://github.com/CSSEGISandData/COVID-19.git
	git fetch forked-upstream
	git checkout master
	git rebase forked-upstream/master
	git push -f origin master
	git checkout develop
	git fetch origin
	git rebase master
	#git push -f origin develop
}

if [ $# == 0 ] || [ $# == 1 ]; then
	rebase $1
else
    usage
    exit 1
fi