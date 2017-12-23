import { render } from 'mustache';
import { cyan, green } from 'chalk';

import { Module, Component } from '../parser/formatters';
import {
  WorldLayout,
  GardenLayout,
  WallThickness,
  TreeLayout,
  TreeWidth,
  LeaveSet,
  LeafType,
  Position,
  Size
} from './layout';

const Header = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="icon" href="favicon.png">
  <title>ngworld</title>
  <script src="./src/aframe-master.js"></script>
  <script src="./src/aframe-extras.min.js"></script>
  <script src="./src/aframe-controller-cursor-component.min.js"></script>
</head>
<body>
  <a-scene physics="" canvas="" keyboard-shortcuts="" vr-mode-ui="">

`;

const Footer = `
<a-entity id="restart" static-body="" geometry="primitive: plane; height: 400; width: 400" position="0 -5 0" rotation="-90 0 0" material="shader: flat; color: green"></a-entity>
  <!-- Camera -->
  <a-entity id="camera" camera="active:true" universal-controls="" kinematic-body="" jump-ability="enableDoubleJump: true; distance: 3;" position="11 1.4515555555555555 45" velocity="0 0 0" gamepad-controls="" keyboard-controls="" touch-controls="" hmd-controls="" mouse-controls="" rotation="4.35447924299426 92.93375437021959 0">
  <a-animation attribute="position" begin="roof" dur="0" to="134 8 2.1"></a-animation>
  <a-animation attribute="position" begin="start" dur="0" to="125 1.8 2.1"></a-animation>
  <a-entity id="blockHand" hand-controls="right" controller-cursor intersection-spawn="event: click; mixin: voxel" position="0 0 5"></a-entity>
  <a-cursor intersection-spawn="event: click; mixin: voxel"></a-cursor>
  </a-entity>
  <!-- Lighting and background -->
  <a-sky src="images/sky.jpg" radius="5000" material="color:#FFF;shader:flat;src:url(images/sky.jpg)" geometry="primitive:sphere;radius:5000;segmentsWidth:64;segmentsHeight:64" scale="-1 1 1"></a-sky>
    <a-entity light="color:#fff;type:ambient" data-aframe-default-light=""></a-entity>
    <a-entity light="color:#fff;intensity:0.2" position="-1 2 1" data-aframe-default-light=""></a-entity>
    <canvas class="a-canvas" width="1152" height="1598" style="height: 799px; width: 576px;"></canvas>
    <div class="a-enter-vr" data-a-enter-vr-no-headset="" data-a-enter-vr-no-webvr="">
      <button class="a-enter-vr-button"></button>
    <div class="a-enter-vr-modal">
      <p>Your browser does not support WebVR. To enter VR, use a VR-compatible browser or a mobile phone.</p>
      <a href="http://mozvr.com/#start" target="_blank">Learn more.</a>
      </div>
    </div>
    <div class="a-orientation-modal a-hidden"><button>Exit VR</button></div></a-scene>
<script>
(function () {
  const entities = [].slice.call(document.getElementsByTagName('a-entity')).
    filter(e => /leaf-\\d-\\d-\\d/.test(e.id));
  entities.forEach(e => e.addEventListener('click', _ => {
    if (e.getAttribute('data-shaked')) {
      return;
    } else {
      e.setAttribute('data-shaked', true);
    }
    const treeId = e.getAttribute('data-tree-id');
    const tree = document.getElementById(treeId);
    tree.emit('shake-front-' + treeId);
    setTimeout(() => {
      document.getElementById(treeId).emit('shake-back-' + treeId);
      setTimeout(() => document.getElementById(treeId).emit('shake-ready-' + treeId), 150);
    }, 150);
    e.emit('shake-' + e.id);
    fetch('http://localhost:8081', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: tree.getAttribute('data-template-url'),
        start: e.getAttribute('data-start-offset'),
        end: e.getAttribute('data-end-offset')
      })
    });
  }));
}());
</script>
</body>
</html>
`;

const TreeTemplate = `
<a-entity id="{{id}}" geometry="primitive: box; depth: 0.1; height: {{height}}; width: 0.2" position="{{x}} {{y}} {{z}}" rotation="0 30 0" material="shader: standard; metalness: 0.6; src: url(images/dirt.jpg); repeat: 1 4" data-template-url="{{{templateUrl}}}">
  <a-entity static-body="" geometry="primitive: box; depth: 0.1; height: {{height}}; width: 0.2" position="-0.1 0 0" rotation="2 60 0" material="shader: standard; metalness: 0.6; src: url(images/dirt.jpg); repeat: 1 4"></a-entity>
  <a-entity static-body="" geometry="primitive: box; depth: 0.1; height: {{height}}; width: 0.2" position="0 0 0.1" rotation="2 -90 0" material="shader: standard; metalness: 0.6; src: url(images/dirt.jpg); repeat: 1 4"></a-entity>
  <a-entity position="0 0 0.4" rotation="-35 -30 0" text="side: double; width: 5; color: white; align: center; value: {{label}};">
  </a-entity>
  {{{leaves}}}
  <a-animation attribute="rotation"¬
               dur="150"¬
               to="5 30 0"¬
               begin="shake-front-{{id}}"
               repeat="0">¬
  </a-animation>¬
  <a-animation attribute="rotation"¬
               dur="150"¬
               to="-3 30 0"¬
               begin="shake-back-{{id}}"
               repeat="0">¬
  </a-animation>¬
  <a-animation attribute="rotation"¬
               dur="150"¬
               to="0 30 0"¬
               begin="shake-ready-{{id}}"
               repeat="0">¬
  </a-animation>¬
</a-entity>
`;

const LeafTemplate = `
<a-entity
  id="{{id}}"
  data-start-offset="{{startOffset}}"
  data-end-offset="{{endOffset}}"
  data-tree-id="{{treeId}}"
  geometry="primitive: box; depth: {{depth}}; height: {{height}}; width: {{width}}"
  position="{{x}} {{y}} {{z}}"
  material="shader: standard; metalness: 0.6; color: {{color}}; repeat: 1 1">
  <a-entity position="0 0 {{halfLeaf}}"
    rotation="0 0 0"
    text="side: double; width: 2; color: white; align: center; value: {{label}};">
  </a-entity>
  <a-entity position="-{{halfLeaf}} 0 0"
    rotation="0 -90 0"
    text="side: double; width: 2; color: white; align: center; value: {{label}};">
  </a-entity>
  <a-entity position="{{halfLeaf}} 0 0"
    rotation="0 90 0"
    text="side: double; width: 2; color: white; align: center; value: {{label}};">
  </a-entity>
  <a-entity position="0 0 -{{halfLeaf}}"
    rotation="0 180 0"
    text="side: double; width: 2; color: white; align: center; value: {{label}};">
  </a-entity>
  <a-animation attribute="position"¬
               dur="1000"¬
               begin="shake-{{id}}"
               fill="forwards"¬
               to="{{x}} 0 {{z}}"¬
               repeat="0">¬
  </a-animation>¬
</a-entity>
`;

const BoxTemplate = `
<a-entity
  static-body=""
  geometry="primitive: box; depth: {{depth}}; height: {{height}}; width: {{width}}"
  position="{{x}} {{y}} {{z}}"
  rotation="{{rotateX}} {{rotateY}} {{rotateZ}}"
  material="shader: flat; transparent: true;
  src: url(images/fence.jpg);
  repeat: {{repeatWidth}} 1">
</a-entity>
`;

const ModuleLabelTemplate = `
<a-entity geometry="primitive: plane; height: 1.2; width: {{width}}" position="{{x}} {{y}} {{z}}" rotation="0 {{rotation}} 0" material="shader: flat; side: double; background: #ddd;">
  <a-entity position="0 0 0" text="width: 4; color: #222; align: {{align}}; value: {{label}};"></a-entity>
  <a-entity static-body="" geometry="primitive: plane; height: 1.5; width: 2" position="0 0 -0.02" rotation="0 0 0" material="shader: flat; side: double; src: url(images/wood.jpg); repeat: 2 2;"></a-entity>
  <a-entity static-body="" geometry="primitive: cylinder; height: 2; radius: 0.06" position="1 -1 -0.1" rotation="0 0 0" material="shader: flat; src: url(images/log.jpg); repeat: 3 1"></a-entity>
  <a-entity static-body="" geometry="primitive: cylinder; height: 2; radius: 0.06" position="-1 -1 -0.1" rotation="0 0 0" material="shader: flat; src: url(images/log.jpg); repeat: 3 1"></a-entity>
</a-entity>
`;

const FrameTemplate = `
<a-entity
  static-body=""
  geometry="primitive: box; depth: {{depth}}; height: {{height}}; width: {{width}}"
  position="{{x}} {{y}} {{z}}"
  rotation="{{rotateX}} {{rotateY}} {{rotateZ}}"
  material="shader: flat; src: url(images/mountain.jpg); repeat: 1 1">
</a-entity>
`;

const FloorTemplate = `
<a-entity static-body="" geometry="primitive: plane; height: {{depth}}; width: {{width}}" position="{{x}} {{y}} {{z}}" rotation="-90 0 0" material="shader: flat; src: url(images/grass.jpg); repeat: 200 200"></a-entity>
`;

interface FloorProperties {
  depth: number;
  width: number;
  x: number;
  y: number;
  z: number;
}

interface FrameProperties {
  x: number;
  y: number;
  z: number;
  depth: number;
  height: number;
  width: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

interface LeafProperties {
  color: string;
  x: number;
  y: number;
  z: number;
  label: string;
  width: number;
  height: number;
  depth: number;
  halfLeaf: number;
  id: string;
  treeId: string;
  endOffset: number;
  startOffset: number;
}

interface TreeProperties {
  x: number;
  y: number;
  z: number;
  height: number;
  label: string;
  id: string;
  leaves: string;
  templateUrl: string;
}

interface LabelProperties {
  label: string;
  align: string;
  x: number;
  y: number;
  z: number;
  color: string;
  width: number;
  rotation: number;
}

interface BoxProperties {
  depth: number;
  height: number;
  width: number;
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  repeatWidth: number;
}

const DoorSize = { width: 3, height: 1.5 };
const TreeHeight = 7;
const TreeBase = 1;
const LeafHeight = 0.7;
const LeafWidth = 0.7;
const LeafDepth = 0.7;

const getFrontWalls = (garden: GardenLayout) => {
  const frontWidth = garden.size.width;
  const frontBottomPartWidth = frontWidth / 2 - DoorSize.width / 2;
  const frontBottomPartHeight = DoorSize.height;

  const frontBottomLeft: BoxProperties = {
    depth: WallThickness,
    height: frontBottomPartHeight,
    width: frontBottomPartWidth,
    x: garden.position.x - (frontWidth / 4 + DoorSize.width / 4),
    y: garden.position.y,
    z: garden.position.z,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    repeatWidth: frontBottomPartWidth
  };
  const frontBottomRight: BoxProperties = {
    depth: WallThickness,
    height: frontBottomPartHeight,
    width: frontBottomPartWidth,
    x: garden.position.x + frontBottomPartWidth + DoorSize.width - (frontWidth / 4 + DoorSize.width / 4),
    y: garden.position.y,
    z: garden.position.z,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    repeatWidth: frontBottomPartWidth
  };
  // const frontTop: BoxProperties = {
  //   depth: WallThickness,
  //   height: garden.size.height - frontBottomPartHeight - garden.position.y,
  //   width: garden.size.width,
  //   x: garden.position.x,
  //   y: frontBottomPartHeight,
  //   z: garden.position.z,
  //   rotateX: 0,
  //   rotateY: 0,
  //   rotateZ: 0
  // };
  const moduleLabel: LabelProperties = {
    x: garden.position.x - DoorSize.width,
    y: 1.8,
    z: garden.position.z + 1,
    label: garden.name,
    align: 'center',
    color: 'white',
    width: 2,
    rotation: Math.random() * 15 * (Math.random() > 0.5 ? -1 : 1)
  };
  return (
    render(ModuleLabelTemplate, moduleLabel) +
    // render(BoxTemplate, frontTop) +
    render(BoxTemplate, frontBottomLeft) +
    render(BoxTemplate, frontBottomRight)
  );
};

const getSideWalls = (garden: GardenLayout) => {
  const leftWall: BoxProperties = {
    x: garden.position.x - garden.size.width / 2 + WallThickness / 2,
    y: garden.position.y,
    z: garden.position.z - garden.size.depth / 2 + WallThickness / 2,
    width: garden.size.depth,
    height: garden.size.height,
    depth: WallThickness,
    rotateX: 0,
    rotateY: 90,
    rotateZ: 0,
    repeatWidth: garden.size.depth
  };
  const rightWall: BoxProperties = {
    x: garden.position.x + garden.size.width / 2 - WallThickness / 2,
    y: garden.position.y,
    z: garden.position.z - garden.size.depth / 2 - WallThickness / 2,
    width: garden.size.depth,
    height: garden.size.height,
    depth: WallThickness,
    rotateX: 0,
    rotateY: 90,
    rotateZ: 0,
    repeatWidth: garden.size.depth
  };
  const backWall: BoxProperties = {
    x: garden.position.x,
    y: garden.position.y,
    z: garden.position.z - garden.size.depth,
    width: garden.size.width,
    height: garden.size.height,
    depth: WallThickness,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    repeatWidth: garden.size.depth
  };
  return render(BoxTemplate, leftWall) + render(BoxTemplate, rightWall) + render(BoxTemplate, backWall);
};

const getLeaves = (leaveSets: LeaveSet[], partialId: string, treeId: string) => {
  const totalLevels = leaveSets.length;
  const renderLevel = (leaves: LeaveSet, level: number) => {
    const fromBottom = (leaveSets.length - 1 - level) * LeafHeight + TreeHeight / 2 - LeafHeight;
    const perRow = Math.ceil(Math.sqrt(leaves.length));
    const result: string[] = [];
    let rowXWidth = perRow * LeafWidth;
    const initialX = -(rowXWidth - LeafWidth) / 2;
    const initialZ = 0;
    let currentX = initialX;
    let currentZ = initialZ;
    for (let i = 0; i < leaves.length; i += 1) {
      let leaf = leaves[i];
      let leafId = partialId + '-' + i;
      let leafProps: LeafProperties = {
        startOffset: leaf.startOffset,
        endOffset: leaf.endOffset,
        label: leaf.label,
        color: leaf.type === LeafType.Plain ? '#8CB300' : '#C1F01A',
        x: currentX,
        y: fromBottom,
        z: currentZ,
        width: LeafWidth,
        height: LeafHeight,
        depth: LeafDepth,
        halfLeaf: LeafWidth / 2,
        treeId: treeId,
        id: leafId
      };
      result.push(render(LeafTemplate, leafProps));
      currentX += LeafWidth;
      if (currentX > rowXWidth + initialX) {
        currentX = initialX;
        currentZ += LeafDepth;
      }
    }
    return result.join('\n');
  };

  let result = '';
  for (let i = leaveSets.length - 1; i >= 0; i -= 1) {
    result += renderLevel(leaveSets[i], i);
  }
  return result;
};

const getTrees = (trees: TreeLayout[], gardenId: number) => {
  return trees
    .map((t, idx) => [
      {
        x: t.position.x,
        z: t.position.z,
        y: 0,
        height: TreeHeight,
        label: t.name,
        id: 'tree-' + gardenId + '-' + idx,
        leaves: '',
        templateUrl: t.templateUrl
      },
      t,
      idx
    ])
    .map(([props, layout, treeIdx]: [TreeProperties, TreeLayout, number]) => {
      const leaves = getLeaves(layout.leaves, 'leaf-' + gardenId + '-' + treeIdx, props.id);
      props.leaves = leaves;
      return render(TreeTemplate, props);
    })
    .join('\n');
};

const renderGarden = (garden: GardenLayout, idx: number) => {
  return getTrees(garden.trees, idx) + getFrontWalls(garden) + getSideWalls(garden);
};

const renderFrame = (p: Position, size: Size) => {
  const front: FrameProperties = {
    x: p.x,
    y: p.y,
    z: p.z,
    width: size.width,
    depth: 1,
    height: size.height,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0
  };

  const back: FrameProperties = {
    x: p.x,
    y: p.y,
    z: p.z - size.depth,
    width: size.width,
    depth: 1,
    height: size.height,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0
  };

  const left: FrameProperties = {
    x: p.x - size.width / 2,
    y: p.y,
    z: p.z - size.depth / 2,
    width: size.depth,
    depth: 1,
    height: size.height,
    rotateX: 0,
    rotateY: 90,
    rotateZ: 0
  };

  const right: FrameProperties = {
    x: p.x + size.width / 2,
    y: p.y,
    z: p.z - size.depth / 2,
    width: size.depth,
    depth: 1,
    height: size.height,
    rotateX: 0,
    rotateY: 90,
    rotateZ: 0
  };

  return (
    render(FrameTemplate, front) +
    render(FrameTemplate, back) +
    render(FrameTemplate, left) +
    render(FrameTemplate, right)
  );
};

const renderFloor = (p: Position, s: Size) => {
  const template: FloorProperties = {
    x: p.x,
    y: -0.2,
    z: p.z,
    width: s.width + p.x,
    depth: s.depth + p.z
  };
  return render(FloorTemplate, template);
};

export const renderWorld = (layout: WorldLayout) => {
  console.log(cyan('🌍 Rendering world...'));

  const gardens = layout.gardens.map((g, idx) => renderGarden(g, idx)).join('\n');
  const frame = renderFrame(layout.position, layout.size);
  const floor = renderFloor(layout.position, layout.size);
  const world = Header + gardens + frame + floor + Footer;

  console.log(green('✅ World rendered!'));

  return world;
};
