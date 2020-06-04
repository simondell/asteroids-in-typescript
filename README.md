# Asteroids

I once attended [SebLy's Creative JS course](https://seblee.me/training/) in which we made the basics of an Asteroids clone. I currently have sizable amounts of free time (thanks, Covid-19), so I'm reworking this sketch. I'm now aiming for a playable game with levels, scores and so on.

I also want to improve my TypeScript and TDD skills, and to use some functional programming techniques. I'd long wondered what it would be like to work with a redux-like state management layer driving an animation. 

Eventually I'll host this and change the notes to reflect dev, hosting, etc. I'll move the "developer story" to the wiki, or a blog.

Read a [description of the original game](https://en.wikipedia.org/wiki/Asteroids_%28video_game%29).

## Developer's log

1. made several slightly different attempts to assemble the tooling: tsc, jest, W3C standard javascript modules; try to avoid having to install and configure babel or webpack explicitly (some other dev dep may do it for me); eventually find ts-jest
2. i want redux-like state + reducers; I assume I also want actions; if I'm writing actions/actionCreators and reducers, I want to skip that boilerplate switch/case stuff, so I also want redux-actions/redux-toolkit like helpers. But I don't really want to use redux. So I start making my own redux, and redux-actions, and reduce-reducers.
3. I put some data in, I draw some shapes
4. I really really miss redux-dev-tools, but I've become stubburn. I'd written my own redux, so I'll use it, dammit. So I build a speed control for the game so that I can log state changes and actions, but not at 60fps, which would kills the browser. 
5. Writing DOM updates based on state changes should be easier in 2020. Oh year, view libraries and frameworks.... yeah... no. I will do it by hand. 
6. So that's why we have view libraries. (which I knew, but I hand't tried to do it by hand since, really since jQuery was hot; no, that's not write. I hadn't done it by hand since I worked at 4th Screen Advertising in 2012 or so)
7. Typing reducers and actionCreators, and generally typing anything created by a factory function is... harder than you'd like.
8. Typing plain old javascript objects is also harder than you'd like, because TS thinks they're rigid maps and wont let you index them with strings, and wont let you add things to them later. This makes composing a state tree as you need it fairly fiddly. I don't think I've solved this yet... I simply reached a point where I had enough definition and declarations to make progress.
9. Bit by by, adding movement, collisions. Some of it's fast & easy; some of it's really head-scratchy. Doing it tests-first helps a lot, much like writing more typical webapp reducers. This is technically a webapp, so that makes sense. That hardest one so far was bullet-asteroid collisions: because a collision would mean removing both an asteroid and a bullet, both arrays "affected" each other. This meant reducing a tuple of all-bullets and all-asteroids down to a tuple the same shape. It took several attempts and two or three conversations with friends to work out that factoring. I feel like I learned something significant from that: I have ended up, roughly, modelling "collisions" and survivors, modelling both as that tuple type, and reducing the survivors from the collisions; this seems like making new, temporary models of a subset of the domain and then updating the full domain model from this subset. Written like that it doesn't sound so grand, but solving it felt like a significant leap forward in my FP understanding. More on this in the future, if I mamage to find better words for it.
10. it turns out I don't need that many actions, so the whole process of writing a mini-redux-with-helpers looks a bit pointless now. Next time I'll use a state tree and direct function calls, rather than actions. That said... I rather like how my `createStore()` returns the helpers you need to read and update the state (in an API broadly copied from React hooks). 