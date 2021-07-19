#!/usr/bin/python

from pkg_resources import parse_version
from optparse import OptionParser
import os, argparse

scriptDir = os.path.dirname(os.path.realpath(__file__))


def main():
    pull_cmd = "cd "+scriptDir+"/.. && git stash && git pull 2>&1"
    print ("INFO: PULLING..."+"\nRUN : "+ pull_cmd)
    pull_cmd_log = os.popen(pull_cmd).read()
    print ("\n"+"LOG :\n" + pull_cmd_log)
    npm_cmd = "npm install 2>&1"
    print ("INFO: UPDATING SOFTWARES"+"\nRUN : "+ npm_cmd)
    npm_cmd_log = os.popen(npm_cmd).read()
    print ("\n"+"LOG :\n" + npm_cmd_log)
    pm2_cmd = "pm2 restart pm2-process.json 2>&1"
    print ("INFO: RESTARTING SERVER"+"\nRUN : "+ pm2_cmd)
    pm2_cmd_log = os.popen(pm2_cmd).read()
    print ("\n"+"LOG :\n" + pm2_cmd_log)
    
    
if __name__ == "__main__":
    main()




