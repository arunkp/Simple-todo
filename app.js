(function(funcName, baseObj) {
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    function ready() {
        if (!readyFired) {
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }

        if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        } else {
            readyList.push({ fn: callback, ctx: context });
        }
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", ready, false);
                window.addEventListener("load", ready, false);
            } else {
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);

docReady(function() {
    document.getElementById("add").focus();
    var dragSrcEl = null;
    var pushedNote = null;
    var counter = 1;
    var notes = JSON.parse(localStorage.getItem("savedData"));
    var addTask = function(e) {
        var colorSelector = document.getElementById("colors");
        var color = colorSelector.options[colorSelector.selectedIndex].value;
        var today = new Date();
        var code = e.which;
        if (code == 13) e.preventDefault();
        var val = e.currentTarget.value;
        if (code == 13 && val.length > 0) {
            var count = ++counter;

            var generator = new IDGenerator();
            var new_id = generator.generate();

            if(lsTest() === true){
                notes.unshift({
                    id: new_id,
                    note: val,
                    color: color,
                    date: today,
                    done: false,
                    isFav: false
                })
                
                localStorage.setItem("savedData", JSON.stringify(notes));
            }

            var html = '<li class="column" draggable="true" id="' +  new_id + '">';
            html += '<div class="done-img">&#10004;</div>';
            html += '<div class="color" style="background:'+color+'"></div>'
            html += '<div class="task-val" contenteditable>'+val+'</div>';
            html += '<div class="options">';
            html += '<a href="#" class="delete">Delete</a>';
            html += '<a href="#" class="done">Mark Done</a>';
            html += '<span class="date" title="' + today.toLocaleString().split(",")[1] + '">' + today.toLocaleString().split(",")[0] + '</span>'
            html += '</div>';
            html += '<a href="#" class="imp">&#9733;</a>';
            html += '</li>';
            var parentHTML = document.getElementById('columns').innerHTML;
            document.getElementById('columns').innerHTML =html + parentHTML;

            var elem = document.querySelectorAll('.column');

            addClickHandlers();

            e.currentTarget.value = "";
        }
        var cols = document.querySelectorAll('#columns .column');
        [].forEach.call(cols, addDnDHandlers);
    }


     function buildTasks(clear) {
        if(clear) {
            document.getElementById("columns").innerHTML = "";
        }
        var notes = JSON.parse(localStorage.getItem("savedData")) ||localStorage.setItem("savedData", JSON.stringify([])) ;
        if (notes.length>0) {
            for(var i=0;i<notes.length;i++) {
                var html = '<li data-index='+ i +' class="column '+ (notes[i].done ? 'task-done ' : ' ') + (notes[i].isFav ? 'imp-task ' : ' ') + '"' +' draggable="true" id="' + notes[i].id + '">';
                html += '<div class="done-img">&#10004;</div>';
                html += '<div class="color" style="background:'+notes[i].color+'"></div>'
                html += '<div contenteditable="'+ (!notes[i].done) +'" class="task-val">'+ notes[i].note+'</div>';
                html += '<div class="options">';
                html += '<a href="#" class="delete">Delete</a>';
                html += '<a href="#" class="done">Mark Done</a>';
                html += '<a href="#" class="undone">Unmark Done</a>';
                html += '<span class="date" title="' + new Date(notes[i].date).toLocaleString().split(",")[1] + '">' + new Date(notes[i].date).toLocaleString().split(",")[0] + '</span>'
                html += '</div>';
                html += '<a href="#" class="imp">&#9733;</a>';
                html += '</li>';
                document.getElementById('columns').innerHTML += html;

                var elem = document.querySelectorAll('.column');

                addClickHandlers();
            }

        }else {
            localStorage.setItem("savedData", JSON.stringify([]))
        }

        var cols = document.querySelectorAll('#columns .column');
        [].forEach.call(cols, addDnDHandlers);
    }

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);

        this.classList.add('dragElem');
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        
        pushedNote = this.getAttribute('data-index');

        this.classList.add('over');
        if (this.classList.contains('dragElem')) {
            this.classList.remove('dragElem');
        }
        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (dragSrcEl != this) {
            this.parentNode.removeChild(dragSrcEl);
            var dropHTML = e.dataTransfer.getData('text/html');
            this.insertAdjacentHTML('beforebegin', dropHTML);
            var dropElem = this.previousSibling;
            
            addDnDHandlers(dropElem);
        } else {
            this.classList.remove('dragElm');
        }
        this.classList.remove('over');
        addClickHandlers();
        return false;
    }

    function addDnDHandlers(elem) {
        elem.querySelector(".task-val").addEventListener("blur",updateNote);
        elem.addEventListener('dragstart', handleDragStart, false);
        elem.addEventListener('dragover', handleDragOver, false);
        elem.addEventListener('dragleave', handleDragLeave, false);
        elem.addEventListener('drop', handleDrop, false);
        elem.addEventListener('dragend', handleDragEnd, false);
    }

    function handleDragEnd(e) {
        this.classList.remove('over');

        Array.prototype.swapItems = function(a, b){
            this[a] = this.splice(b, 1, this[a])[0];
            return this;
        }

        var lsnotes = JSON.parse(localStorage.getItem("savedData"));

        lsnotes.swapItems(pushedNote, e.currentTarget.getAttribute('data-index'));

        localStorage.setItem("savedData", JSON.stringify(lsnotes))
    }

    function makeTaskImp(e) {
        e.preventDefault();
        var li = e.currentTarget.closest('li');
        var lsnotes = JSON.parse(localStorage.getItem("savedData"));
        for( var i = 0; i < lsnotes.length; i++){
           if ( lsnotes[i].id === li.id) {
                lsnotes[i].isFav = !lsnotes[i].isFav;
                if(li.classList.contains('imp-task')) {
                    li.classList.remove('imp-task');
                }else {
                    li.classList.add('imp-task');
                }
           }
        }
        localStorage.setItem("savedData", JSON.stringify(lsnotes))
        // if (!li.classList.contains('imp-task')) {
        //     li.classList.add('imp-task');
            
        // } else {
        //     li.classList.remove('imp-task');
        // }
    }

    function addClickHandlers() {
        var deleteLink = document.querySelectorAll('.delete');
        for (var i = 0; i < deleteLink.length; i++) {
            deleteLink[i].addEventListener('click', deleteTask);
        }

        var impLink = document.querySelectorAll('.imp');
        for (var j = 0; j < impLink.length; j++) {
            impLink[j].addEventListener('click', makeTaskImp);
        }

        var doneLink = document.querySelectorAll('.done');
        for (var k = 0; k < doneLink.length; k++) {
            doneLink[k].addEventListener('click', doneTask);
        }

        var doneLink = document.querySelectorAll('.undone');
        for (var k = 0; k < doneLink.length; k++) {
            doneLink[k].addEventListener('click', doneTask);
        }
    }

    function doneTask(e) {
        e.preventDefault();
        var li = e.currentTarget.closest('li');
        var lsnotes = JSON.parse(localStorage.getItem("savedData"));

        for( var i = 0; i < lsnotes.length; i++){ 
           if ( lsnotes[i].id === li.id) {
                lsnotes[i].done = !lsnotes[i].done;
                if(li.classList.contains('task-done')) {
                    li.classList.remove('task-done');
                }else {
                    li.classList.add('task-done');
                }
           }
        }
        localStorage.setItem("savedData", JSON.stringify(lsnotes))
        buildTasks(true);
        
    }

    function deleteTask(e) {
        e.preventDefault();
        var lsnotes = JSON.parse(localStorage.getItem("savedData"));
        var li = e.currentTarget.closest('li');
        for( var i = 0; i < lsnotes.length; i++){ 
           if ( lsnotes[i].id === li.id) {
             lsnotes.splice(i, 1); 
           }
        }
        localStorage.setItem("savedData", JSON.stringify(lsnotes))
        buildTasks(true);
    }

    function lsTest(){
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }

    function IDGenerator() {
     
         this.length = 8;
         this.timestamp = +new Date;
         
         var _getRandomInt = function( min, max ) {
            return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
         }
         
         this.generate = function() {
             var ts = this.timestamp.toString();
             var parts = ts.split( "" ).reverse();
             var id = "";
             
             for( var i = 0; i < this.length; ++i ) {
                var index = _getRandomInt( 0, parts.length - 1 );
                id += parts[index];  
             }
             
             return id;
         }

         
     }

    function updateNote(e) {
        var lsnotes = JSON.parse(localStorage.getItem("savedData"));
        var li = e.currentTarget.closest('li');
        for( var i = 0; i < lsnotes.length; i++){ 
           if ( lsnotes[i].id === li.id) {
             lsnotes[i].note = e.currentTarget.innerText; 
           }
        }
        localStorage.setItem("savedData", JSON.stringify(lsnotes));
        buildTasks(true);
    }

    if(lsTest() === true){
        buildTasks();
    }

    document.getElementById('add').addEventListener('keyup', addTask);
});