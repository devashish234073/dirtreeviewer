# dirtreeviewer

'treetocanvas.js' converts a directory into interactive flow chart. As shown below. The chart can be stretched with the format menu to increase the spacing. Also a particular directory can be seen in detail by choosing from the drop-down:

![pica](https://user-images.githubusercontent.com/20777854/39407451-ebfa0b5e-4be3-11e8-93bd-f2fdddefe7d0.png)

When 'index.js' is run with --fName arg it  needs a file containing list of packages each separated by '.' as shown below.
And it displays them as dir structure.

![picu](https://user-images.githubusercontent.com/20777854/39322163-955086aa-49a6-11e8-96a1-f82e600487c4.png)

When run with --dir arg , it scans all the child dir and outputs the same structure as above.

![picu](https://user-images.githubusercontent.com/20777854/39322431-7a9d2dbc-49a7-11e8-8914-454fa7ae4872.png)

It can also ignore particular format with "--ignr" arg. For example in the above screenshot i may want ".cpp" files not to be shown. And I can use "--ignr .cpp" for that.

![picu](https://user-images.githubusercontent.com/20777854/39322641-2e312eaa-49a8-11e8-92d7-13a63d76b1da.png)

