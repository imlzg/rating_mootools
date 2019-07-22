var Rating = new Class({
    Implements: [Events, Options],
    options: {
        url: null,
        async: true,
        scale: 5,
        value: 0,
        locked: false,
        image: '/styles/img/rating.png',
        showMessage: false,
        showColumn: false,
        starSize: {
            width: 16,
            height: 16
        },
        colors: {
            activeColor: '#ffa800',
            votedColor: '#ff7676',
            fillColor: '#ddd'
        },
        values: {
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5
        },
        messages: {
            1: "不好",
            2: "一般",
            3: "还行",
            4: "好看",
            5: "精彩"
        },
        columns: {
            columnValue: 0,
            columnColor: '#ddd',
            columnSize: {
                width: 0,
                height: 14
            }
        },
        callbacks: {
            onMouseenter: $empty,
            onMouseleave: $empty,
            onClick: $empty
        },
        requests: {
            onComplete: $empty,
            onSuccess: $empty,
            onRequest: $empty,
            onFailure: $empty,
            onException: $empty,
            onCancel: $empty
        }
    },
    initialize: function(options){
        this.setOptions(options);

        this.star = new Element('img', {
            'styles': {
                'border': 'none',
                'width': this.options.starSize.width,
                'height': this.options.starSize.height
            }
        });
        this.stars = new Element('div', {
            'styles': {
                'float': 'left',
                'width': this.options.starSize.width * this.options.scale
            }
        });
        this.column = new Element('div', {
            'styles': {
                'float': 'left',
                'margin-left': 3,
                'text-align': 'center',
                'font-size': '60%',
                'height': this.options.columns.columnSize.height,
                'background': this.options.columns.columnColor
            }
        });
        this.message = new Element('div', {
            'styles': {
                'float': 'left',
                'margin-left': 3,
                'width': 30
            }
        });



    },
    inject: function(el, options){
        var co = $(el);
        options = $merge(this.options, options);

        this.star.set('src', options.image);
        var stars = this.stars.clone();
        stars.value = options.value;
        stars.value_key = 0;
        stars.locked = options.locked;
        stars.showColumn = options.showColumn;
        stars.columnValue = options.columns.columnValue;
        stars.columnWidth = options.columns.columnSize.width;
        stars.showMessage = options.showMessage;
        stars.url = options.url;
        stars.async = options.async;

        stars.callbacks = options.callbacks;
        stars.requests = options.requests;

        for (var k=1; k <= this.options.scale; k++){
            var img = this.star.clone();
            img.value = this.options.values[k];
            img.value_key = k;

            if (! stars.locked){
                img.set({
//                    'title': this.options.messages[k],
                    'styles': {
                        'cursor': 'pointer'
                    },
                    'events': {
                        'mouseenter': this.mouseenter.bindWithEvent(this),
                        'mouseleave': this.mouseleave.bindWithEvent(this),
                        'click': this.click.bindWithEvent(this)
                    }
                });
            }

            if (this.options.values[k] <= stars.value){
                img.setStyle('background', this.options.colors.votedColor);
            }else{
                img.setStyle('background', this.options.colors.fillColor);
            }

            if (this.options.values[k] == stars.value){
                stars.value_key = k;
            }
            stars.adopt(img);
        }
        co.adopt(stars);

        if (stars.showColumn){
            var column = this.column.clone();
            column.set({
                'styles': {
                    'width': stars.columnWidth
                }
            });
            if (stars.columnValue > 0){
                column.set('text', stars.columnValue);
            }
            stars.column = column;
            co.adopt(column);
        }

        if (stars.showMessage){
            var message = this.message.clone();
            if (stars.value > 0){
                message.set('text', this.options.messages[stars.value_key]);
            }
            stars.message = message;
            co.adopt(message);
        }

        if (stars.locked){
            co.set('title', this.options.messages[stars.value_key]);
        }
    },
    mouseenter: function(e){
        if(e) e = new Event(e).stop();
        var stars = e.target.getParent();
        
        this.changeColor(stars, e.target.value, this.options.colors.activeColor, this.options.colors.fillColor);
        if (stars.showMessage){
            this.changeMessage(stars, e.target.value_key);
        }
        stars.callbacks.onMouseenter(e.target);
    },
    mouseleave: function(e){
        if(e) e = new Event(e).stop();
        var stars = e.target.getParent();

        this.changeColor(stars, stars.value, this.options.colors.votedColor, this.options.colors.fillColor);
        if (stars.showMessage){
            this.changeMessage(stars, stars.value_key);
        }
        stars.callbacks.onMouseleave(e.target);
    },
    click: function(e){
        if(e) e = new Event(e).stop();
        var stars = e.target.getParent();

        stars.value = e.target.value;
        stars.value_key = e.target.value_key;

        this.changeColor(stars, stars.value, this.options.colors.votedColor, this.options.colors.fillColor);

        if (stars.showMessage){
            this.changeMessage(stars, stars.value_key);
        }

        stars.callbacks.onClick(e.target);

        if (stars.url) {
            var req = new Request({
                url: stars.url + stars.value,
                async: stars.async,
                onComplete: stars.requests.onComplete,
                onSuccess: stars.requests.onSuccess,
                onRequest: stars.requests.onRequest,
                onFailure: stars.requests.onFailure,
                onException: stars.requests.onException,
                onCancel: stars.requests.onCancel
            });
            req.send();
        }

    },
    changeColor: function(stars, v, c1, c2){
        stars.getChildren().each(function(i){
            if (i.value <= v){
                i.setStyle('background', c1);
            }else{
                i.setStyle('background', c2);
            }
        });
    },
    changeMessage: function(stars, k){
        stars.message.set('text', this.options.messages[k]);
    }
});