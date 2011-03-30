#!/usr/local/bin/python

# Copyright 2009, 2010, 2011 Northwestern Univrsity and Jonathan A. Smith
# Licensed under the Educational Community License, Version 2.0 (the "License"); 
# you may not use this file except in compliance with the License. You may
# obtain a copy of the License at
#
# http://www.osedu.org/licenses/ECL-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
# or implied. See the License for the specific language governing
# permissions and limitations under the License.
#
# Author: Jonathan A, Smith

from tiled_image import *
from optparse import OptionParser
   
if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-b", "--bgcolor", dest="bgcolor", default = "0xFFFFFF",
            help="background color as an RBG hex number, ex: 0xFFFFFF")
    (options, args) = parser.parse_args()
    bgcolor = eval(options.bgcolor)
    if len(args) < 1:
        parser.error("mising image")
    source_file_path = args[0]
    
    if len(args) < 2:
        tiled_image = TiledImage.fromSourceImage(source_file_path)
    else:
        output_path = args[1]
        tiled_image = TiledImage.fromSourceImage(source_file_path, output_path)
        
    print "\nDone."