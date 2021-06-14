/* eslint-disable */
import d3 from './library/d3_3.5.3';
import 'd3-mitch-tree/dist/css/d3-mitch-tree.min.css';
import 'd3-mitch-tree/dist/css/d3-mitch-tree-theme-default.min.css';
d3.mitchTree = require('d3-mitch-tree/dist/js/d3-mitch-tree.min.js');
let $s = { tree: {}, scope: {} };

d3.contextMenu = function(men, openCallback) {
  // create the div element that will hold the context menu
  d3.selectAll('.d3-context-menu')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'd3-context-menu');

  // close menu
  d3.select('body').on('click.d3-context-menu', function() {
    d3.select('.d3-context-menu').style('display', 'none');
  });

  // this gets executed when a contextmenu event occurs
  return function(data, index) {
    const parentIds = data.data.parentIds;
    const parentLabels = data.data.parentLabels;
    const parentId = data.data.parentId;
    let menu = [];
    menu.push({
      title: 'Show Fields',
      action: function(elm, d, i) {
        $('.nav-tabs a[href="#collTab_' + data.data.id + '"]').tab('show');
      }
    });
    if (parentLabels.length > 1) {
      for (var k = 0; k < parentLabels.length; k++) {
        const selparentIds = parentIds[k];
        if (parentId != selparentIds) {
          menu.push({
            title: `Change View for ${parentLabels[k]} Branch`,
            action: function(elm, d, i) {
              $s.tree[data.data.projectID][data.data.id]['parentId'] = selparentIds;
              refreshTreeView(data.data.projectID, $s.scope, true);
            }
          });
        }
      }
    }

    var elm = this;

    d3.selectAll('.d3-context-menu').html('');
    var list = d3.selectAll('.d3-context-menu').append('ul');
    list
      .selectAll('li')
      .data(menu)
      .enter()
      .append('li')
      .html(function(d) {
        return typeof d.title === 'string' ? d.title : d.title(data);
      })
      .on('click', function(d, i) {
        d.action(elm, data, index);
        d3.select('.d3-context-menu').style('display', 'none');
      });

    // the openCallback allows an action to fire before the menu is displayed
    // an example usage would be closing a tooltip
    if (openCallback) {
      if (openCallback(data, index) === false) {
        return;
      }
    }

    // display context menu
    d3.select('.d3-context-menu')
      .style('left', d3.event.pageX - 2 + 'px')
      .style('top', d3.event.pageY - 2 + 'px')
      .style('display', 'block');

    d3.event.preventDefault();
    d3.event.stopPropagation();
  };
};

const getTreeData = ($scope, projectID) => {
  const projectData = $scope.projects.filter(e => e._id == projectID);
  const projectName = projectData[0].name;
  const projectCollections = $scope.collections.filter(e => e.projectID == projectID);
  const projectCollectionsIDs = projectCollections.map(e => e._id);
  let treeData = [];
  treeData.push({ id: 'project', description: projectName, parentId: null, parentIds: [] });
  let rootIds = [];
  for (var i = 0; i < projectCollections.length; i++) {
    const collectionID = projectCollections[i]._id;
    let obj = { id: collectionID };
    const refFields = $scope.fields.filter(e => e.collectionID == collectionID && e.ref);
    const refCollectionIDs = [];
    const refCollectionLabels = [];
    for (var k = 0; k < refFields.length; k++) {
      let ref = refFields[k].ref;
      const PREFIX = `${projectName}_`;
      if (ref.indexOf(PREFIX) == 0) {
        const refCollectionName = ref.slice(PREFIX.length);
        const refColl = projectCollections.filter(e => e.name == refCollectionName);
        if (refColl && refColl[0]) {
          refCollectionIDs.push(refColl[0]._id);
          refCollectionLabels.push(refColl[0].label);
        }
      }
    }
    obj['parentIds'] = refCollectionIDs;
    obj['parentLabels'] = refCollectionLabels;
    // obj['name'] = projectCollections[i].name;
    obj['description'] = projectCollections[i].label;
    obj['projectID'] = projectID;
    if (refCollectionIDs[0] && projectCollectionsIDs.includes(refCollectionIDs[0])) {
      if ($s.tree[projectID][collectionID] && $s.tree[projectID][collectionID]['parentId']) {
        obj['parentId'] = $s.tree[projectID][collectionID]['parentId'];
      } else {
        obj['parentId'] = refCollectionIDs[0];
        $s.tree[projectID][collectionID] = {};
        $s.tree[projectID][collectionID]['parentId'] = refCollectionIDs[0];
      }
    } else {
      obj['parentId'] = 'project';
      rootIds.push(collectionID);
    }
    treeData.push(obj);
  }

  const arrayToTree = (items, id = null, link = 'parentId') =>
    items
      .filter(item => item[link] === id)
      .map(item => ({ ...item, children: arrayToTree(items, item.id) }));
  const data = arrayToTree(treeData);
  if (data[0]) {
    return data[0];
  }
  return data;
};

// document.getElementById('focusButton').addEventListener('click', function(){
//     var value = document.getElementById('focusText').value;
//     var nodeMatchingText = treePlugin.getNodes().find(function(node){
//         return node.data.name == value;
//     });
//     if (nodeMatchingText)
//         treePlugin.focusToNode(nodeMatchingText);
//     else if (value != null)
//         treePlugin.focusToNode(value);
// });

export const refreshTreeView = (projectID, $scope, reload) => {
  $s.scope = $scope;
  if (document.getElementById(`d3-tree-${projectID}`)) {
    const isTreeViewInitialized = $(`#d3-tree-${projectID}`).html();
    if (!isTreeViewInitialized || reload) {
      if (!$s.tree[projectID]) $s.tree[projectID] = {};
      var data = getTreeData($scope, projectID);
      var treePlugin = new d3.mitchTree.boxedTree()
        .setData(data)
        .setMinScale(0.001)
        .setElement(document.getElementById(`d3-tree-${projectID}`))
        .setIdAccessor(function(data) {
          return data.id;
        })
        .setChildrenAccessor(function(data) {
          return data.children;
        })
        .setBodyDisplayTextAccessor(function(data) {
          return data.description;
        })
        .setTitleDisplayTextAccessor(function(data) {
          return data.name;
        })
        //.setOrientation('topToBottom')
        // .setMargins({
        //   top: 0,
        //   right: 0,
        //   bottom: 0,
        //   left: 0
        // })
        .getNodeSettings()
        .setSizingMode('nodesize')
        .setVerticalSpacing(25)
        .setHorizontalSpacing(10)
        .back()
        .initialize();

      treePlugin.getZoomListener().scaleTo(treePlugin.getSvg(), 1.6);
      treePlugin
        .getZoomListener()
        .translateTo(treePlugin.getSvg(), treePlugin.getWidthWithoutMargins() / 2, 0);

      // Expand all nodes
      //   var nodes = treePlugin.getNodes();
      //   nodes.forEach(function(node, index, arr) {
      //     treePlugin.expand(node);
      //   });
      //   treePlugin.update(treePlugin.getRoot());

      // events: {
      //   nodeClick: function(data, index, arr) {
      //     this.removeSelection(this.getRoot());
      //     event.nodeDataItem.selected = true;
      //     this.centerNode(event.nodeDataItem);
      //     // Cancel the collapse event
      //     if (event.type === 'collapse') event.preventDefault();
      //   }
      // }

      var multiParentMenu = [
        {
          title: 'Edit Collection',
          action: function(elm, d, i) {
            console.log(elm);
            console.log(d);
            console.log(i);
          }
        }
      ];

      function updateTreeClasses(treePlugin) {
        treePlugin
          .getPanningContainer()
          .selectAll('g.node')
          .attr('class', function(data, index, arr) {
            var existingClasses = this.getAttribute('class');
            let multiParent = 'single-parent';
            if (data.data.parentIds.length > 1) {
              multiParent = 'multi-parent';
            }
            return existingClasses + ' ' + multiParent;
          });
        d3.selectAll('g.node').on('contextmenu', d3.contextMenu());
      }

      //Override the core update method, so it'd call our custom update method
      treePlugin.update = function(nodeDataItem) {
        // Call the original update method
        this.__proto__.update.call(this, nodeDataItem);
        updateTreeClasses(this);
      };
      updateTreeClasses(treePlugin);

      var singleParentMenu = [
        {
          title: 'Edit Collection',
          action: function(elm, d, i) {
            console.log(elm);
            console.log(d);
            console.log(i);
          }
        }
      ];

      //   console.log(treePlugin);
      //   var nodes = treePlugin.getNodes();
      //   nodes.forEach(function(node, index, arr) {
      //     console.log(node);
      //     console.log(arr);
      //   });

      //   d3.selectAll('g.node.single-parent').on('contextmenu', d3.contextMenu(singleParentMenu));
      //   const multiParentNodes = d3.selectAll('g.node.multi-parent');
      //   console.log(multiParentNodes);
      //   for (var k = 0; k < multiParentNodes.length; k++) {
      //     console.log(multiParentNodes[k]);
      //   }
      //   d3.selectAll('g.node').classed('multi-parent', function(data, index) {
      //     if (data.data.parentIds.length > 1) {
      //       return true;
      //     }
      //     return false;
      //   });
    }
  }
};
