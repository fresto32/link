import * as THREE from 'three'

export default function()
{

  const material = new THREE.MeshPhongMaterial({
    color: 0x282a36
  })

  return material
}