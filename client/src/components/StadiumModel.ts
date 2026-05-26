/**
 * StadiumModel - Three.js 精细体育场3D建模
 * 
 * 参考贺龙体育馆的碗形结构，程序化生成精美的3D体育场模型
 * 包含：椭圆看台、弧形屋顶、草坪、跑道、灯光塔、座椅纹理等
 */

import * as THREE from 'three';

interface StadiumOptions {
  teamColor: string;
  teamName: string;
  stadiumName: string;
}

export function createStadiumModel(options: StadiumOptions): THREE.Group {
  const { teamColor, teamName, stadiumName } = options;
  const group = new THREE.Group();
  
  const color = new THREE.Color(teamColor);
  const colorDark = color.clone().multiplyScalar(0.6);
  const colorLight = color.clone().lerp(new THREE.Color(0xffffff), 0.3);

  // ============ 1. 地基平台 ============
  const baseGeo = new THREE.CylinderGeometry(180, 195, 8, 64);
  const baseMat = new THREE.MeshPhongMaterial({
    color: 0xd4d0c8,
    specular: 0x222222,
    shininess: 20,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 4;
  group.add(base);

  // 外围装饰环
  const outerRingGeo = new THREE.TorusGeometry(190, 3, 8, 64);
  const outerRingMat = new THREE.MeshPhongMaterial({
    color: colorDark.getHex(),
    specular: 0x444444,
    shininess: 40,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 8;
  group.add(outerRing);

  // ============ 2. 跑道 ============
  const trackShape = new THREE.Shape();
  // 椭圆跑道外圈
  const trackOuter = 155;
  const trackInner = 130;
  const trackA = 1.35; // 长轴比例
  
  // 外圈
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * trackOuter * trackA;
    const z = Math.sin(angle) * trackOuter;
    if (i === 0) trackShape.moveTo(x, z);
    else trackShape.lineTo(x, z);
  }
  // 内圈（反向）
  const holePath = new THREE.Path();
  for (let i = 64; i >= 0; i--) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * trackInner * trackA;
    const z = Math.sin(angle) * trackInner;
    if (i === 64) holePath.moveTo(x, z);
    else holePath.lineTo(x, z);
  }
  trackShape.holes.push(holePath);

  const trackGeo = new THREE.ExtrudeGeometry(trackShape, { depth: 1, bevelEnabled: false });
  const trackMat = new THREE.MeshPhongMaterial({
    color: 0xcc4422,
    specular: 0x111111,
    shininess: 10,
  });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = -Math.PI / 2;
  track.position.y = 9;
  group.add(track);

  // 跑道白线标记
  for (let lane = 0; lane < 6; lane++) {
    const r = trackInner + (trackOuter - trackInner) * (lane / 6);
    const lineGeo = new THREE.TorusGeometry(r * 1.15, 0.3, 4, 64);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = Math.PI / 2;
    line.position.y = 10.2;
    line.scale.set(trackA / 1.15, 1, 1 / 1.15);
    group.add(line);
  }

  // ============ 3. 草坪 ============
  const fieldGeo = new THREE.PlaneGeometry(240, 160, 12, 8);
  // 创建草坪条纹纹理
  const fieldCanvas = document.createElement('canvas');
  fieldCanvas.width = 512;
  fieldCanvas.height = 512;
  const fctx = fieldCanvas.getContext('2d')!;
  // 绿色草坪条纹
  for (let i = 0; i < 16; i++) {
    fctx.fillStyle = i % 2 === 0 ? '#2d8c3c' : '#35a044';
    fctx.fillRect(0, i * 32, 512, 32);
  }
  // 中线
  fctx.strokeStyle = '#ffffff';
  fctx.lineWidth = 3;
  fctx.beginPath();
  fctx.moveTo(256, 30);
  fctx.lineTo(256, 482);
  fctx.stroke();
  // 中圈
  fctx.beginPath();
  fctx.arc(256, 256, 50, 0, Math.PI * 2);
  fctx.stroke();
  // 中点
  fctx.fillStyle = '#ffffff';
  fctx.beginPath();
  fctx.arc(256, 256, 4, 0, Math.PI * 2);
  fctx.fill();
  // 禁区
  fctx.strokeRect(30, 170, 80, 172);
  fctx.strokeRect(402, 170, 80, 172);
  // 小禁区
  fctx.strokeRect(30, 210, 35, 92);
  fctx.strokeRect(447, 210, 35, 92);
  // 球门区弧线
  fctx.beginPath();
  fctx.arc(110, 256, 50, -Math.PI / 2, Math.PI / 2);
  fctx.stroke();
  fctx.beginPath();
  fctx.arc(402, 256, 50, Math.PI / 2, -Math.PI / 2);
  fctx.stroke();
  // 边线
  fctx.strokeRect(30, 30, 452, 452);

  const fieldTexture = new THREE.CanvasTexture(fieldCanvas);
  fieldTexture.wrapS = THREE.RepeatWrapping;
  fieldTexture.wrapT = THREE.RepeatWrapping;
  
  const fieldMat = new THREE.MeshPhongMaterial({
    map: fieldTexture,
    specular: 0x111111,
    shininess: 5,
  });
  const field = new THREE.Mesh(fieldGeo, fieldMat);
  field.rotation.x = -Math.PI / 2;
  field.position.y = 9.5;
  group.add(field);

  // 球门
  for (const side of [-1, 1]) {
    const goalGroup = new THREE.Group();
    // 门柱
    const postGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 8);
    const postMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x888888, shininess: 80 });
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-8, 6, 0);
    goalGroup.add(leftPost);
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(8, 6, 0);
    goalGroup.add(rightPost);
    // 横梁
    const barGeo = new THREE.CylinderGeometry(0.8, 0.8, 16.8, 8);
    const bar = new THREE.Mesh(barGeo, postMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 12, 0);
    goalGroup.add(bar);
    // 球网（简化）
    const netGeo = new THREE.PlaneGeometry(16, 12, 8, 6);
    const netMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, 6, -4);
    goalGroup.add(net);
    
    goalGroup.position.set(side * 122, 9.5, 0);
    goalGroup.rotation.y = side > 0 ? 0 : Math.PI;
    group.add(goalGroup);
  }

  // ============ 4. 看台（碗形结构 - 贺龙体育馆风格） ============
  const standSegments = 80;
  const standRows = 6;
  const standBaseHeight = 10;
  const standTopHeight = 55;
  
  // 看台分为4个区域，每个区域颜色略有不同
  const sectionColors = [
    color.getHex(),
    colorLight.getHex(),
    color.getHex(),
    colorDark.getHex(),
  ];

  for (let section = 0; section < 4; section++) {
    const startAngle = (section / 4) * Math.PI * 2;
    const endAngle = ((section + 1) / 4) * Math.PI * 2;
    const segsPerSection = standSegments / 4;
    
    for (let row = 0; row < standRows; row++) {
      const innerR = 160 + row * 8;
      const outerR = 160 + (row + 1) * 8;
      const bottomH = standBaseHeight + (row / standRows) * (standTopHeight - standBaseHeight);
      const topH = standBaseHeight + ((row + 1) / standRows) * (standTopHeight - standBaseHeight);
      
      const shape = new THREE.Shape();
      // 构建看台截面
      const points: THREE.Vector2[] = [];
      for (let i = 0; i <= segsPerSection; i++) {
        const angle = startAngle + (i / segsPerSection) * (endAngle - startAngle);
        points.push(new THREE.Vector2(
          Math.cos(angle) * innerR * 1.2,
          Math.sin(angle) * innerR
        ));
      }
      for (let i = segsPerSection; i >= 0; i--) {
        const angle = startAngle + (i / segsPerSection) * (endAngle - startAngle);
        points.push(new THREE.Vector2(
          Math.cos(angle) * outerR * 1.2,
          Math.sin(angle) * outerR
        ));
      }
      
      shape.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
      }
      shape.closePath();

      const extrudeSettings = {
        depth: topH - bottomH,
        bevelEnabled: false,
      };
      
      const standGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      
      // 座椅颜色：交替显示队伍颜色和白色
      const seatColor = row % 2 === 0 ? sectionColors[section] : 0xf0f0f0;
      const standMat = new THREE.MeshPhongMaterial({
        color: seatColor,
        specular: 0x222222,
        shininess: 15,
        flatShading: false,
      });
      
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.rotation.x = -Math.PI / 2;
      stand.position.y = bottomH;
      group.add(stand);
    }
  }

  // 看台顶部边缘装饰
  const rimGeo = new THREE.TorusGeometry(205, 2.5, 6, 64);
  const rimMat = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    specular: 0x666666,
    shininess: 60,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = standTopHeight + 2;
  rim.scale.set(1.2, 1, 1);
  group.add(rim);

  // ============ 5. 屋顶遮阳棚（弧形膜结构 - 贺龙体育馆标志性设计） ============
  const roofSegments = 24;
  for (let i = 0; i < roofSegments; i++) {
    const angle = (i / roofSegments) * Math.PI * 2;
    const nextAngle = ((i + 1) / roofSegments) * Math.PI * 2;
    
    // 每隔一个做遮阳棚
    if (i % 2 === 0) {
      const roofShape = new THREE.Shape();
      const innerR = 175;
      const outerR = 220;
      const midR = (innerR + outerR) / 2;
      
      // 弧形遮阳棚曲面
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(
          Math.cos(angle) * innerR * 1.2,
          standTopHeight + 5,
          Math.sin(angle) * innerR
        ),
        new THREE.Vector3(
          Math.cos((angle + nextAngle) / 2) * midR * 1.2,
          standTopHeight + 25,
          Math.sin((angle + nextAngle) / 2) * midR
        ),
        new THREE.Vector3(
          Math.cos((angle + nextAngle) / 2) * (outerR - 10) * 1.2,
          standTopHeight + 20,
          Math.sin((angle + nextAngle) / 2) * (outerR - 10)
        ),
        new THREE.Vector3(
          Math.cos(nextAngle) * outerR * 1.2,
          standTopHeight + 8,
          Math.sin(nextAngle) * outerR
        ),
      );
      
      const tubeGeo = new THREE.TubeGeometry(curve, 12, 8, 6, false);
      const roofMat = new THREE.MeshPhongMaterial({
        color: 0xf8f8f8,
        specular: 0xaaaaaa,
        shininess: 80,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });
      const roofPiece = new THREE.Mesh(tubeGeo, roofMat);
      group.add(roofPiece);
    }
    
    // 支撑柱
    if (i % 3 === 0) {
      const pillarGeo = new THREE.CylinderGeometry(1.5, 2.5, standTopHeight + 10, 8);
      const pillarMat = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x666666,
        shininess: 50,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(
        Math.cos(angle) * 195 * 1.2,
        (standTopHeight + 10) / 2,
        Math.sin(angle) * 195
      );
      group.add(pillar);
    }
  }

  // ============ 6. 灯光塔 ============
  const lightPositions = [
    { angle: Math.PI * 0.15, r: 210 },
    { angle: Math.PI * 0.85, r: 210 },
    { angle: Math.PI * 1.15, r: 210 },
    { angle: Math.PI * 1.85, r: 210 },
  ];

  for (const lp of lightPositions) {
    const towerGroup = new THREE.Group();
    
    // 灯塔柱
    const towerGeo = new THREE.CylinderGeometry(2, 3.5, 75, 8);
    const towerMat = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x666666,
      shininess: 40,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 37.5;
    towerGroup.add(tower);
    
    // 灯具面板
    const lightPanelGeo = new THREE.BoxGeometry(14, 10, 2);
    const lightPanelMat = new THREE.MeshPhongMaterial({
      color: 0x333333,
      emissive: 0xffffcc,
      emissiveIntensity: 0.8,
    });
    const lightPanel = new THREE.Mesh(lightPanelGeo, lightPanelMat);
    lightPanel.position.y = 78;
    lightPanel.lookAt(0, 30, 0);
    towerGroup.add(lightPanel);
    
    // 灯光效果（发光球）
    const glowGeo = new THREE.SphereGeometry(5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffdd,
      transparent: true,
      opacity: 0.4,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 78;
    towerGroup.add(glow);
    
    towerGroup.position.set(
      Math.cos(lp.angle) * lp.r * 1.2,
      0,
      Math.sin(lp.angle) * lp.r
    );
    group.add(towerGroup);
  }

  // ============ 7. 入口通道 ============
  const entranceAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  for (const ea of entranceAngles) {
    const entranceGeo = new THREE.BoxGeometry(25, 18, 12);
    const entranceMat = new THREE.MeshPhongMaterial({
      color: color.getHex(),
      specular: 0x333333,
      shininess: 30,
    });
    const entrance = new THREE.Mesh(entranceGeo, entranceMat);
    entrance.position.set(
      Math.cos(ea) * 200 * 1.2,
      9,
      Math.sin(ea) * 200
    );
    entrance.lookAt(0, 9, 0);
    group.add(entrance);
    
    // 入口顶部装饰
    const canopyGeo = new THREE.BoxGeometry(30, 2, 16);
    const canopyMat = new THREE.MeshPhongMaterial({
      color: 0xf0f0f0,
      specular: 0x888888,
      shininess: 60,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(
      Math.cos(ea) * 200 * 1.2,
      19,
      Math.sin(ea) * 200
    );
    canopy.lookAt(0, 19, 0);
    group.add(canopy);
  }

  // ============ 8. 外围广场和道路 ============
  // 环形广场
  const plazaGeo = new THREE.RingGeometry(195, 230, 64);
  const plazaMat = new THREE.MeshPhongMaterial({
    color: 0xc8c0b8,
    specular: 0x111111,
    shininess: 5,
    side: THREE.DoubleSide,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 1;
  plaza.scale.set(1.2, 1, 1);
  group.add(plaza);

  // ============ 9. 记分牌 ============
  for (const side of [-1, 1]) {
    const boardGeo = new THREE.BoxGeometry(40, 15, 2);
    const boardMat = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: color.getHex(),
      emissiveIntensity: 0.3,
      specular: 0x444444,
      shininess: 50,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 42, side * 165);
    group.add(board);
    
    // 屏幕发光效果
    const screenGeo = new THREE.PlaneGeometry(38, 13);
    const screenMat = new THREE.MeshBasicMaterial({
      color: color.getHex(),
      transparent: true,
      opacity: 0.6,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 42, side * 165 + side * 1.1);
    group.add(screen);
  }

  // 整体缩放（单位：米）
  group.scale.set(0.5, 0.5, 0.5);
  
  return group;
}
