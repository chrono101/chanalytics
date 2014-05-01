===============
OVERALL DESIGN
===============
- All work done client-side
- No historical data, all analysis must be made using the cuurent thread data alone
- 1 page split into major sections
  - Controls (navigation, board selection)
  - Timeline (time-series analysis of replies)
  - Replies (general analysis of replies)
  - Images (analysis of images and replies with images)
  - Comments (analysis of the keywords and content of replies)
- Major sections further divided into tabs using bootstrap
  - Tabs can then be 1, 2, or 3-column layouts

===============
MISC
===============
- Look into Apache Mahout and Python NLPTK
- Look into D3 library

===============
GENERAL ISSUES
===============
[MAYB] - "Affix" navigation
[DONE] - ScrollSpy navigation
[DONE] - Primary controls
[TODO] - Refactor code
[NO] - Get CORS working (replaced with YQL JSONP)
[DONE] - Move this to Git
[TODO] - Standardize IDs
[TODO] - Standardize JS variables and function names

===============
TIMELINE ANALYTICS
===============
[DONE] - When were all replies made? {TIMELINE-REPLIES}
[DONE] - When were replies with images only made? {TIMELINE-REPLIES}
[DONE] - When were replies with comments only made? {TIMELINE-REPLIES}
[DONE] - When were replies with both made? {TIMELINE-REPLIES}
[NO] - When did any Name reply? 
[DONE] - When did ID X reply? {TIMELINE-IDS}
[DONE] - When did Country X reply? {TIMELINE-COUNTRIES}
[DONE] - When did Name X reply? {TIMELINE-NAMES}
[DONE] - When did Anonymous reply? {TIMELINE-NAMES}

===============
REPLY ANALYTICS
===============
[DONE] General info

[DONE] - Thread Link
[DONE] - OP Time
[DONE] - # Total Replies
[DONE] - # Replies Image only {GRAPH/PIE} 
[DONE] - # Replies Comment only {GRAPH/PIE}
[DONE] - # Replies Image + Comment {GRAPH/PIE}

[UPDT] Time between replies

[DONE] - Total thread length
[DONE] - Longest gap (may indicate thread revivals)
[UPDT] - Shortest gap (may indicate samefagging) 
[DONE] - Average gap between replies
[DONE] - Time to first reply
[DONE] - Replies per minute

[TODO] Influential replies

- Replies that have lots of replies themselves
- Link to those replies

[DONE] Map

- Geo map of replies, on boards that support it

[TODO] Reply Chaining

- Some sort of visualization of showing the reply chains in a thread

===============
IMAGE ANALYTICS
===============
[DONE] Largest & Smallest Images
[DONE] - Largest Dimensions (show filename + ext)
[DONE] - Largest Filesize (human readable) (show filename + ext)
[DONE] - Smallest Dimensions (show filename + ext)
[DONE] - Smallest Filesize (human readable) (show filename + ext)
- Add link to images

[UPDT] Image source identification

[DONE] - identify source of image based of file name
[DONE] - Tumblr
[DONE] - Facebook
[DONE] - imgur
[DONE] - 4chan
[TODO] - Screenshot/Snapshot
- etc.

[TODO] 4chan Image Repost date

- Using 4chan filename format, figure out when image was last posted
- "X time ago" format (with exact date on mouseover)

[DONE] Embedded Archive

- Take (width*height)/bytes
- Sort by highest ratio
[TODO] - List full filename  with link

[TODO] Image Extensions

- Add Pie Chart

[TODO] Image Filenames

- Add Link to images

===============
COMMENT ANALYTICS
===============


