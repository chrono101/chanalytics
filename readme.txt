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
GENERAL ISSUES
===============
[MAYB] - "Affix" navigation
[DONE] - ScrollSpy navigation
[DONE] - Primary controls
[TODO] - Refactor code
[NO] - Get CORS working (replaced with YQL JSONP)
[DONE] - Move this motherfucker to Git

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
[TODO] General info

- Thread Link
- OP Time
- # Total Replies
- # Replies Image only {GRAPH/PIE} 
- # Replies Comment only {GRAPH/PIE}
- # Replies Image + Comment {GRAPH/PIE}

[TODO] Time between replies

- Longest gap (may indicate thread revivals)
- Shortest gap (may indicate samefagging) 
- Average gap between replies
- Time to first reply

[TODO] Influential replies

- Replies that have lots of replies themselves
- Link to those replies

===============
IMAGE ANALYTICS
===============
[UPDT] Largest & Smallest Images
- Largest Dimensions (show filename + ext)
- Largest Filesize (human readable) (show filename + ext)
[TODO] - Smallest Dimensions (show filename + ext)
[TODO] - Smallest Filesize (human readable) (show filename + ext)

[UPDT] Image source identification

- identify source of image based of file name
- Tumblr
- Facebook
- imgur
- 4chan
[TODO] - Screenshot/Snapshot
- etc.

[TODO] 4chan Image Repost date

- Using 4chan filename format, figure out when image was last posted
- "X time ago" format

===============
COMMENT ANALYTICS
===============


