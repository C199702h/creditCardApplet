Component({
    data: {
        showTabbar: false,
        selected: 0,
        color: "#AAAAAA",
        selectedColor: "#221715",
        list: [{
            pagePath: "/pages/index/index",
            iconPath: "/images/home-gray.png",
            selectedIconPath: "/images/home.png",
            text: "首页"
        }, {
            pagePath: "/pages/business/business/business",
            iconPath: "/images/friday.png",
            selectedIconPath: "/images/maidouyou.png",
            text: ""
        }, {
            pagePath: "/pages/mine/mine",
            iconPath: "/images/mine-gray.png",
            selectedIconPath: "/images/mine.png",
            text: "我的"
        }]
    },
    attached() {
    },
    methods: {
        switchTab(e) {
            console.log(this.data.showTabbar);
            if (!this.data.showTabbar) return;
            console.log(e);
            const data = e.currentTarget.dataset
            const url = data.path
            wx.switchTab({url})
            this.setData({
                selected: data.index
            })
        }
    }
})