#!/bin/bash
# This is a student test
cd "$(dirname "$0")" || exit 1

result=$(../../c/process.sh < page.html)
expected="doctype
lang
en
head
meta
charset
utf
meta
viewport
content
device
initial
scale
title
title
style
body
font
family
arial
sans
serif
margin
padding
background
color
color
align
center
container
max
px
margin
auto
padding
px
color
caf
color
decoration
font
size
em
hover
color
footer
margin
px
padding
px
background
color
color
white
align
center
style
head
body
div
class
container
simple
links
check
href
level
stuff
check
href
level
stuff
check
href
level
stuff
div
div
class
footer
rights
div
body"
if [ "$result" = "$expected" ]; then
  echo "Test passed"
  exit 0
else
  echo "Test failed"
  echo "Expected:"
  echo "$expected"
  echo "Got:"
  echo "$result"
  exit 1
fi