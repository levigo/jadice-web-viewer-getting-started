# JwvGettingStarted

Steps in this commit: replace the dummy frontend with a simple viewer version

After checking out this commit, please build both client and server and then run them.

You will now see a viewer when openening ``localhost:4200``, that can now display documents, once you upload a document via the ``open file``file button in the upper left corner.

This is done by the two jadice web viewer components included in the ``app.component.html`` file. The necessary wiring of those and releated code is found in the ``app.component.ts``

Inside the main.ts, we bootstrap the precursor which will serve as a layer between angular and GWT.

