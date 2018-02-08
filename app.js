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
    var counter = 1;
    var addTask = function(e) {
        var today = new Date();
        var code = e.which;
        if (code == 13) e.preventDefault();
        var val = e.currentTarget.value;
        if (code == 13 && val.length > 0) {
            var count = ++counter;
            var html = '<li class="column" draggable="true" id="task' + count + '">';
            html += '<div class="done-img">&#10004;</div>';
            html += '<div>';
            html += val;
            html += '</div>';
            html += '<div class="options">';
            html += '<a href="#" class="delete">Delete</a>';
            html += '<a href="#" class="done">Mark Done</a>';
            html += '<span class="date" title="' + today.toLocaleString().split(",")[1] + '">' + today.toLocaleString().split(",")[0] + '</span>'
            html += '</div>';
            html += '<a href="#" class="imp">&#9733;</a>';
            html += '</li>';
            document.getElementById('columns').innerHTML += html;

            var elem = document.querySelectorAll('.column');

            addClickHandlers();

            e.currentTarget.value = "";
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
        elem.addEventListener('dragstart', handleDragStart, false);
        elem.addEventListener('dragover', handleDragOver, false);
        elem.addEventListener('dragleave', handleDragLeave, false);
        elem.addEventListener('drop', handleDrop, false);
        elem.addEventListener('dragend', handleDragEnd, false);

    }

    function handleDragEnd(e) {
        this.classList.remove('over');
    }

    function makeTaskImp(e) {
        e.preventDefault();
        var li = e.currentTarget.closest('li');
        if (!li.classList.contains('imp-task')) {
            li.classList.add('imp-task');
        } else {
            li.classList.remove('imp-task');
        }
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
    }

    function doneTask(e) {
        e.preventDefault();
        var li = e.currentTarget.closest('li');
        li.classList.add('done');
        li.querySelector('.imp').remove();
        e.currentTarget.remove();
    }

    function deleteTask(e) {
        e.preventDefault();
        e.currentTarget.closest('li').remove();
    }

    document.getElementById('add').addEventListener('keyup', addTask);
});