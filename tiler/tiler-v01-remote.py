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

import os, os.path, sys, xml.dom
from optparse import OptionParser
from math import *
import Image

IMAGE_TEMPLATE = "tile%04in%04i.jpg"
LAYER_TEMPLATE = "layer%04i"

class Pyramid:
    """Coordinate model of a tiled image."""

    def __init__(self, image_size, tile_size=(256, 256), 
            resolution_multiplier=sqrt(2), bgcolor = 0xFFFFFF):
        """Initializes a Pyramid model."""
        self.image_size = image_size
        self.tile_size = tile_size
        self.resolution_multiplier = resolution_multiplier
        self.initializeLayerCount()
        self.bgcolor = bgcolor
        
    def initializeLayerCount(self):
        """Computes the number of layers in an image pyramid"""
        (image_width, image_height) = self.image_size
        (tile_width, tile_height) = self.tile_size
        log_multiplier = log(self.resolution_multiplier)
        width_layers = (log(image_width) - log(tile_width)) / log_multiplier
        height_layers = (log(image_height) - log(tile_height)) / log_multiplier
        self.layer_count = int(ceil(max(width_layers, height_layers)) + 1)
        
    def scaleForLayer(self, layer_number):
        """Returns the image scale at the specified layer"""
        layer_index = self.layer_count - layer_number - 1
        return 1 / self.resolution_multiplier ** layer_index
        
    def layerForScale(self, scale):
        """Returns the layer number at or just above the specified scale"""
        last_layer = self.layer_count - 1;
        level = log(scale) / -log(self.resolution_multiplier)
        return max(last_layer - floor(level + 0.0000001), 0)
        
    def tileExtent(self, layer_number):
        """Returns the (width, height) of the image area covered by a tile"""
        layer_index = self.layer_count - layer_number - 1
        (tile_width, tile_height) = self.tile_size
        scale = self.resolution_multiplier ** layer_index
        return (int(tile_width * scale), int(tile_height * scale))
        
    def tileGridSize(self, layer_number):
        """Returns the number of tile (columns, rows) in a layer"""
        (image_width, image_height) = self.image_size
        (extent_width, extent_height) = self.tileExtent(layer_number)
        return ( int(ceil(float(image_width)  / extent_width)),
                 int(ceil(float(image_height) / extent_height)) )
                 
    def tileColumn(self, x, layer_number):
        tile_width = self.tile_size[0]
        resolution_multiplier = self.resolution_multiplier
        layer_index = self.layer_count - layer_number - 1
        extent = tile_width * (resolution_multiplier ** layer_index)
        return int(floor(x / extent))
        
    def tileRow(self, y, layer_number):
        tile_height = self.tile_size[1]
        resolution_multiplier = self.resolution_multiplier
        layer_index = self.layer_count - layer_number - 1
        extent = tile_height * (resolution_multiplier ** layer_index)
        return int(floor(y / extent))
                 
    def toXML(self):
        """Returns an XML document describing this coordinate system"""
        implementation = xml.dom.getDOMImplementation()
        document = implementation.createDocument(
            "http://dewey.at.northwestern.edu/ppad-defs.xml#", 
            "ppad:tiled-image", None)
        element = document.documentElement
        element.setAttribute("xmlns:ppad",
                "http://dewey.at.northwestern.edu/ppad-defs.xml#")
        element.setAttribute("tile_format", "jpg")
        element.setAttribute("layers", str(self.layer_count))
        element.setAttribute("resolution_multiplier",
                str(self.resolution_multiplier))
        element.setAttribute("bgcolor", "0x%X" % self.bgcolor)

        self.generateSizeXML(document, element)
        self.generateTileXML(document, element)
        self.generateTransformXML(document, element)

        return document
        
    def generateSizeXML(self, document, element):
        """Generate XML for image dimensions"""
        size_element = document.createElement("ppad:dimensions")
        element.appendChild(size_element)
        size_element.setAttribute("property", "image_size")
        size_element.setAttribute("width", str(self.image_size[0]))
        size_element.setAttribute("height", str(self.image_size[1]))
        
    def generateTileXML(self, document, element):
        """Generate XML for tile dimensions"""
        tile_element = document.createElement("ppad:dimensions")
        element.appendChild(tile_element)
        tile_element.setAttribute("property", "tile_size")
        tile_element.setAttribute("width", str(self.tile_size[0]))
        tile_element.setAttribute("height", str(self.tile_size[1])) 
        
    def generateTransformXML(self, document, element):
        """Generate XML for transform matrix"""
        transform_element = document.createElement("ppad:transform")
        element.appendChild(transform_element)
        transform_element.setAttribute("property", "transform")
        transform_element.appendChild(
            document.createTextNode("\n\t1 0 0\n\t0 1 0\n\t0 0 1\n"))
        
    def __repr__(self):
        """Return a string represenation of this object"""
        return ("Pyramid(image_size=%s, tile_size=%s, resolution_multiplier=%s)"
            % (self.image_size, self.tile_size, self.resolution_multiplier))
            
class TiledImage:
    """Represents a (potential) tiled image on disk."""
    
    def __init__(self):
        self.background = (255, 255, 255)
        
    def setTilePath(self, tile_path):
        self.tile_path = tile_path

    def setSize(self, width, height):
        """Sets the image size, creates a pyramid model"""
        self.image_size = (width, height)
        self.pyramid = Pyramid(self.image_size)
        
    def getScaledImage(self, request_area, scale):
        """Get an image covering the request_area at a specified scale."""
        pyramid = self.pyramid
        layer_number = pyramid.layerForScale(scale)
        tile_section = self.getTileSection(request_area, layer_number)
        tile_section = self.cropTileSection(tile_section, request_area,
                layer_number)
        (left, top, right, bottom) = request_area  
        result_width  = int((right  - left) * scale)
        result_height = int((bottom - top ) * scale)
        print "Resize section: %s to: %s " % (tile_section.size, (result_width, result_height))
        return tile_section.resize((result_width, result_height),
                Image.ANTIALIAS)
        
    def getTileSection(self, request_area, layer_number):
        """Return an image on tile boundries that covers a requested area."""
        pyramid = self.pyramid
        tile_size = pyramid.tile_size
        
        (left, top, right, bottom) = request_area        
        left_column  = pyramid.tileColumn(  left, layer_number)
        right_column = pyramid.tileColumn( right, layer_number)
        top_row      = pyramid.tileRow   (   top, layer_number)
        bottom_row   = pyramid.tileRow   (bottom, layer_number)
        
        (tile_width, tile_height) = pyramid.tile_size
        section_width  = ((right_column - left_column + 1) * tile_width )
        section_height = ((bottom_row   - top_row     + 1) * tile_height)
        section_size=(section_width, section_height)
        print "Making section image size: %s" % (section_size, )
        section_image = Image.new("RGB", section_size, self.background)
        for row in xrange(top_row, bottom_row + 1):
            for column in xrange(left_column, right_column + 1):
                tile_image = self.getTileImage(column, row, layer_number)
                paste_left = (column - left_column) * tile_size[0]
                paste_top  = (row - top_row) * tile_size[1]
                print "pasting at: (%s, %s)" % (paste_left, paste_top)
                section_image.paste(tile_image, (paste_left, paste_top))

        return section_image
    
    def cropTileSection(self, section, request_area, layer_number):
        """Crop section image (at a specified layer) to fit the request area."""
        pyramid = self.pyramid
        scale = pyramid.scaleForLayer(layer_number)
        tile_size = pyramid.tile_size
        (left, top, right, bottom) = request_area
        section_left   = (left * scale) % tile_size[0]
        section_top    = (top  * scale) % tile_size[1]
        section_right  = section_left + (right  - left) * scale
        section_bottom = section_top  + (bottom - top ) * scale
        return section.crop(
                (section_left, section_top, section_right, section_bottom))
        
    def getTileImage(self, column, row, layer_number):
        """Return a tile for a specified column, row, and layer number"""
        print "Getting tile at layer %i: %s" % (
                layer_number, IMAGE_TEMPLATE % (row, column))
        tile_path = self.tileFilePath(column, row, layer_number)
        return Image.open(tile_path)
        
    def tileFilePath(self, column, row, layer_number):
        """Returns a file path string with the file name for a specific tile"""
        layer_name = LAYER_TEMPLATE % layer_number
        file_name = IMAGE_TEMPLATE % (row, column)        
        path = os.path.join(self.tile_path, layer_name, file_name)
        directory = os.path.dirname(path)
        if not os.path.exists(directory):
            os.makedirs(directory)  
            
        return path
            
class SourceImage(TiledImage):
    """Represents an image to be tiled"""

    def __init__(self, source_path, out_path = None, bgcolor = 0xFFFFFF):
        TiledImage.__init__(self)
        self.source_path = source_path
        tile_path = self.makeTilePath(source_path, out_path)
        self.setTilePath(tile_path)
        self.bgcolor = bgcolor
        
    def makeTilePath(self, source_path, out_path = None):
        """Create a tile path from the source path"""
        (directory, file_name) = os.path.split(source_path)
        (name, ext) = os.path.splitext(file_name)
        if out_path == None: out_path = os.path.join(directory, "_images")
        return os.path.join(out_path, name)
                
    def generateTiles(self):
        source_path = self.source_path
        source_image = Image.open(source_path)
        print "Tiling: %s as: %s" % (source_path, self.tile_path)
        print "Format: %s, Size: %s, Mode: %s" % (
                source_image.format, source_image.size, source_image.mode)
        print "Background color: 0x%X" % self.bgcolor
                
        bgcolor = self.bgcolor
        pyramid = Pyramid(source_image.size, bgcolor = bgcolor)
        self.generateContentsXML(pyramid)
        self.pyramid = pyramid
        
        self.background = (bgcolor >> 16 & 0xFF, bgcolor >> 8 & 0xFF,
                bgcolor & 0xFF)
                
        print "Tile Size: %s\nTile Layers: %s\n" % (
                pyramid.tile_size, pyramid.layer_count)
    
        count = pyramid.layer_count
        for layer_number in xrange(count - 1, -1, -1):
            self.generateTileLayer(source_image, pyramid, layer_number)
            
        self.generateThumbnail()

        
    def generateTileLayer(self, source_image, pyramid, layer_number):
        scale = pyramid.scaleForLayer(layer_number)
        (columns, rows) = pyramid.tileGridSize(layer_number)
        print "generating layer%04i: %i x %i at scale = %1.5f" % (
                layer_number, columns, rows, scale)
        for row in xrange(rows):
            for column in xrange(columns):
                self.generateTile(column, row, layer_number, 
                        pyramid, source_image)
                                
    def generateTile(self, column, row, layer_number, pyramid, source_image):
        """Crop, scale, and write an image tile"""
        
        file_path = self.tileFilePath(column, row, layer_number)
        if os.path.exists(file_path): return
        
        source_rectangle = self.tileSourceRectangle(column, row, 
                layer_number, pyramid) 
        
        scale = pyramid.scaleForLayer(layer_number)
        width  = int(ceil(scale * (source_rectangle[2] - source_rectangle[0])))
        height = int(ceil(scale * (source_rectangle[3] - source_rectangle[1])))
        
        name = os.path.basename(file_path)
        print "%s: %s x %s" % (name, width, height)
       
        if layer_number > -1:        
            tile_source = source_image.crop(source_rectangle)
            scaled_tile = tile_source.resize((width, height), Image.ANTIALIAS)
        else:
            scaled_tile = self.getScaledImage(source_rectangle, scale)

        tile = Image.new("RGB", pyramid.tile_size, self.background)             
        tile.paste(scaled_tile, (0, 0))
        tile.save(file_path, "jpeg")
        
    def tileSourceRectangle(self, column, row, layer_number, pyramid):
        """Return area of source image to be put on tile"""
        (extent_width, extent_height) = pyramid.tileExtent(layer_number)
        left = extent_width * column
        top = extent_height * row
        right = min(left + extent_width, pyramid.image_size[0])
        bottom = min(top + extent_height, pyramid.image_size[1])
        return (left, top, right, bottom)  
        
    def generateThumbnail(self):
        """Generate a fixed size image thumbnail"""
         
        thumbnail_path = os.path.join(self.tile_path, "thumbnail.jpg")
        if os.path.exists(thumbnail_path): return
        
        (source_width, source_height) = self.pyramid.image_size
        source_rectangle = (0, 0, source_width, source_height);
        scale = 150.0 / source_width
        print "source_width = %s, scale = %s" % (source_width, scale)
        scaled_tile = self.getScaledImage(source_rectangle, scale)
        
        thumbnail_height = int(source_height * scale)
        
        print "Writing thumbnail"

        tile = Image.new("RGB", (150, thumbnail_height))             
        tile.paste(scaled_tile, (0, 0))
        tile.save(thumbnail_path, "jpeg")       
        
    def generateContentsXML(self, pyramid):
        """Write a content.xml file with a description of the image"""
        document = pyramid.toXML()
        if not os.path.exists(self.tile_path):
            os.makedirs(self.tile_path)
        contents_file = os.path.join(self.tile_path, "contents.xml")
        out = open(contents_file, "w")
        print >>out, document.toxml("UTF-8")
        out.close()

        
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
        tiled_image = SourceImage(source_file_path, bgcolor = bgcolor)
    else:
        output_path = args[1]
        tiled_image = SourceImage(source_file_path, 
                output_path, bgcolor = bgcolor)
    tiled_image.generateTiles()
    print "\nDone."
