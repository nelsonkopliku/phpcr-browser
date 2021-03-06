define([
    'angular'
], function (angular) {
    'use strict';

    var $$hashKeyIndex = 0;

    function decorateTreeFactory($provide) {
        $provide.decorator('$treeFactory', ['$delegate', '$q', '$findPatcher', function($delegate, $q, $findPatcher) {
            var activatedTree = null;

            var $originalDelegate = $delegate;
            $delegate = function(data) {
                var tree = $originalDelegate(data);
                // Pre compute $$hashKey to improve rendering speed
                tree.visitor()(function(node) {
                    node.$$hashKey = $$hashKeyIndex++;
                });

                $findPatcher.patch(tree, $originalDelegate);

                return tree;
            };

            angular.extend($delegate, $originalDelegate);

            $delegate.activate = function(tree) {
                if (activatedTree) {
                    activatedTree.attr('active', false);
                }
                activatedTree = tree;
                tree.attr('active', true);
            };

            $delegate.walkChildren = function(tree, cb) {
                cb(tree);
                var children = tree.children();
                for (var i in children) {
                    if (children.hasOwnProperty(i)) {
                        $delegate.walkChildren(children[i], cb);
                    }
                }
            };

            $delegate.walkParent = function(tree, cb) {
                var parent = tree.parent();

                if (parent) {
                    cb(parent);
                    $delegate.walkParent(parent, cb);
                }
            };

            return $delegate;
        }]);
    }

    decorateTreeFactory.$inject = ['$provide'];

    return decorateTreeFactory;
});

