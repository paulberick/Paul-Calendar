\# Paulmanac Data Specification



The `data` folder contains curated content used by Paulmanac.



Files in this folder are the authoritative source.



Generated files in `/engine` are NEVER edited manually.



\---



\## skyEvents.json



Each object represents one astronomical event.



```json

{

&#x20;   "date":"2026-08-12",

&#x20;   "type":"meteor",

&#x20;   "icon":"☄",

&#x20;   "title":"Perseids",

&#x20;   "description":"",

&#x20;   "learnMore":""

}

```



Required



\- date

\- type

\- icon

\- title



Optional



\- description

\- learnMore



\---



Included event types



meteor



lunar-eclipse



solar-eclipse



conjunction



comet



\---



Editorial Rules



Include only events that reward stepping outside.



Moon phases are generated separately.



Solar turnings are generated separately.



Exclude penumbral lunar eclipses.



Only conjunctions involving:



\- Moon

\- Mercury

\- Venus

\- Mars

\- Jupiter

\- Saturn



No event ranking.



No priorities.



Chronology alone determines display order.



The Paulmanac presents six upcoming events.

