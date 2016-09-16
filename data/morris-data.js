$(function () {
    Morris.Area({
        element: 'morris-area-chart',
        data: data,
        xkey: 'start',
        ykeys: ['dur'],
        labels: ['dur'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
});
