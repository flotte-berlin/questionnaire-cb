/**
 * summary.js
 * Author: Hiroyoshi Kurohara(Microgadget,inc.)
 * Author E-Mail: kurohara@yk.rim.or.jp
 * License: GPLv2 or Lator.
 */

jQuery(function($) {
  if (!self.Qst) {
    self.Qst = {};
  }
  var Qst = self.Qst;

  var SummaryTotal = Qst.SummaryTotal = Backbone.Model.extend({
    initialize: function() {
      this.url = qstnr_data.admin_ajax_url + "?" +
        $.param({
          action: "qstnr_summary",
          nonce: qstnr_data.nonce,
          postid: qstnr_data.postid,
        });
    },
    parse: function(data, options) {
      var chartData = [];
      for (var i in data) {
        if (data[i].type !== 'text') {
          var item = {};
          item.title = data[i].title;
          item.type = (data[i].type === 'radio' || data[i].type === 'option') ? "pie" : "bar";
          item.datatype = data[i].type;
          item.validCount = data[i].valid;
          item.data = [];
          for (var j in data[i].selections) {
            var point = {
              itemname: data[i].selections[j],
              count: data[i].selected[data[i].selectedname[j]],
            };
            item.data.push(point);
          }
          //for numbers: sort data by itemname
          if(data[i].type === 'number') {
            item.data = _.sortBy(item.data, function(o) { return parseInt(o.itemname); })
          }
          chartData.push(item);
        }
      }
      this.set('chartData', chartData);
      return {};
    },
    chartData: function() {
      return this.get('chartData');
    },
  });
  var SummaryView = Qst.SummaryView = Backbone.View.extend({
    el: ".qstnr-summary",
    template: _.template('<div class="qstnr-chart-title"><%= chartTitle %></div><div class="qstnr-chart <%= addclass %>" id="<%= chartid %>"></div>'),
    initialize: function() {
      this.listenTo(this.model, "sync", function() {
        this.render();
      });
    },
    render: function() {
      var chartData = this.model.chartData();
      var chartIndex = 1;
      if (chartData.length === 0) {
        this.$el.html("<p>no valid data</p>");
      } else {
        this.$el.html("");
      }
      _.each(chartData, function(data) {
        var chartDivParam = null;
        var chartParams = null;
        var chartid = "";
        switch (data.type) {
          case 'pie':
            chartid = "qstnr-chart-pie-" + chartIndex;
            chartDivParam = {
              chartid: chartid,
              addclass: "qstnr-chart-pie",
              chartTitle: data.title
            };
            chartParams = {
              type: "pie",
              theme: "light",
              dataProvider: data.data,
              titleField: "itemname",
              valueField: "count",
              maxLabelWidth: 300
            };
            break;
          case 'bar':
            chartid = "qstnr-chart-bar-" + chartIndex;
            chartDivParam = {
              chartid: chartid,
              addclass: "qstnr-chart-bar",
              chartTitle: data.title
            };
            chartParams = {
              type: "serial",
              theme: "light",
              dataProvider: data.data,
              graphs: [{
                type: "column",
                valueField: "count",
                fillAlphas: 1.0,
                lineAlphas: 0.2,
              }, ],
              valueAxes: [{
                precision: 0,
              }, ],
              categoryField: "itemname",
              rotate: data.datatype == 'number' ? false : true,
              categoryAxis: {
                autoGridCount: false,
                gridCount: data.data.length
              }
            };
            break;
          default:
            break;
        }
        chartDivParam.chartTitle = chartDivParam.chartTitle + ",  total valid answers = " + data.validCount;
        this.$el.append($(this.template(chartDivParam)));
        var chart = AmCharts.makeChart(chartid, chartParams);
        ++chartIndex;
      }.bind(this));
    },
  });

});
