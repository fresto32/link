import * as THREE from 'three'

// TODO: Explore alternative methods to determine how to choose Y for some 
//       object:
//          - Ray casting
//          - Distance between some planar point and the closest vertex in 
//              object
//          - Use Box3's BoundingBox feature

export default function IsIntersecting(plane: THREE.Mesh, object: THREE.Group | THREE.Mesh): boolean
{
  // Ensure plane and object's positions are updated...
  plane.updateWorldMatrix(true, true)
  object.updateWorldMatrix(true, true)

  return object.children.some(c => 
    {
      if (c instanceof THREE.Mesh) 
      {
        if (pointsOfIntersection(plane, c)) return true
      }
      else if (c instanceof THREE.Group) 
      {
        c.children.forEach(v => 
          {
            if (IsIntersecting(plane, v as (THREE.Group | THREE.Mesh))) return true
          })
      }
    })
}

function pointsOfIntersection(plane: THREE.Mesh, object: THREE.Mesh): boolean
{
  // Shared initialized vectors and lines to save on initialization time...
    // Points on the object
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
    // Points on the plane
  const planePointA = new THREE.Vector3()
  const planePointB = new THREE.Vector3()
  const planePointC = new THREE.Vector3()
    // Lines between object vertices
  const lineAB = new THREE.Line3()
  const lineBC = new THREE.Line3()
  const lineCA = new THREE.Line3()

  // Calculate a Plane from 3 vertices of plane
  const mathPlane: THREE.Plane = setMathPlane(plane)

  // Check intersections at each face...
  if (object.geometry instanceof THREE.Geometry) 
  {
    return processFaces(object, object.geometry, mathPlane)
  }
  else if (object.geometry instanceof THREE.BufferGeometry) 
  {
    return processBufferFaces(object, object.geometry, mathPlane)
  }
  

  function setMathPlane(plane: THREE.Mesh): THREE.Plane
  {
    const mathPlane = new THREE.Plane()
    if (plane.geometry instanceof THREE.BufferGeometry)
    {
      // if indexed buffer geometry...
      if (plane.geometry.attributes.index !== undefined)
      {
        if (plane.geometry.attributes.position instanceof THREE.InterleavedBufferAttribute) 
        {
          console.log("Interleaved Buffer Geometry sent to setMathPlane(...)")
          return
        }

        // Convert vertices to world localised points in planePointX...
        plane.localToWorld(planePointA.fromBufferAttribute(plane.geometry.attributes.position, 0));
        plane.localToWorld(planePointB.fromBufferAttribute(plane.geometry.attributes.position, 1));
        plane.localToWorld(planePointC.fromBufferAttribute(plane.geometry.attributes.position, 2));

        // Create a plane from the world localised points...
        mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);
      }
      else // buffer geometry must be non-indexed
      {
        const length = plane.geometry.attributes.position.array.length
        const startIndex = 0
        const midIndex = Math.floor(length / 2) - (length % 2 === 1? 1 : 0)
        // TODO: Fix this placeholder... Need to determine another suitable
        //       coplanar point (i.e. a point where one and only 1 axes is the
        //       same as another axes point -> (0, 30, 50) and (0, 30, 60) are
        //       not suitable)
        const endIndex = 309 

        // Find each vertex from the position array...

        const x1 = plane.geometry.attributes.position.array[startIndex]
        const y1 = plane.geometry.attributes.position.array[startIndex + 1]
        const z1 = plane.geometry.attributes.position.array[startIndex + 2]
        planePointA.set(x1, y1, z1)

        const x2 = plane.geometry.attributes.position.array[midIndex]
        const y2 = plane.geometry.attributes.position.array[midIndex + 1]
        const z2 = plane.geometry.attributes.position.array[midIndex + 2]
        planePointB.set(x2, y2, z2)

        const x3 = plane.geometry.attributes.position.array[endIndex]
        const y3 = plane.geometry.attributes.position.array[endIndex + 1]
        const z3 = plane.geometry.attributes.position.array[endIndex + 2]
        planePointC.set(x3, y3, z3)

        // Localise planePointX to world coordinates...
        plane.localToWorld(planePointA) 
        plane.localToWorld(planePointB) 
        plane.localToWorld(planePointC) 

        // Create a plane from the world localised points...
        mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);
      }
    }
    else if (plane.geometry instanceof THREE.Geometry)
    {
      // Localise planePointX to world coordinates from the vertices of a single face...
      plane.localToWorld(planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
      plane.localToWorld(planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
      plane.localToWorld(planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));

        // Create a plane from the world localised points...
      mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);
    }
    return mathPlane
  }

  function processFaces(object: THREE.Mesh, geometry: THREE.Geometry, mathPlane: THREE.Plane): boolean
  {
    geometry.faces.forEach(function(face) {
      // Localize a, b, and c to world coordinates from the vertices of a single face...
      object.localToWorld(a.copy(geometry.vertices[face.a]));
      object.localToWorld(b.copy(geometry.vertices[face.b]));
      object.localToWorld(c.copy(geometry.vertices[face.c]));

      // Create lines between each vertex...
      lineAB.set(a, b)
      lineBC.set(b, c)
      lineCA.set(c, a)
      
      // Determine if any line intersects the plane...
      return setPointOfIntersection(lineAB, mathPlane) ||
             setPointOfIntersection(lineBC, mathPlane) ||
             setPointOfIntersection(lineCA, mathPlane)
    });
    return false
  }

  function processBufferFaces(object: THREE.Mesh, geometry: THREE.BufferGeometry, mathPlane: THREE.Plane)
  {
    if (geometry.attributes.position instanceof THREE.InterleavedBufferAttribute) 
    {
      console.log("Interleaved Buffer Geometry sent to processBufferFaces(...)")
      return false
    }

    // Make once and reuse...
    const vertex1 = new THREE.Vector3()
    const vertex2 = new THREE.Vector3()
    const vertex3 = new THREE.Vector3()

    for (let i = 0; i < geometry.attributes.position.array.length; i += 3)
    {
      // Performing confusing work to find vertex indices from buffer geometry...
      const faceIndex = i / 3
      const vertex1Index = geometry.index.array[3 * faceIndex + 0]
      const vertex2Index = geometry.index.array[3 * faceIndex + 1]
      const vertex3Index = geometry.index.array[3 * faceIndex + 2]

      // Getting each vertex using vertex indices...
      vertex1.fromBufferAttribute(geometry.attributes.position, vertex1Index)
      vertex2.fromBufferAttribute(geometry.attributes.position, vertex2Index)
      vertex3.fromBufferAttribute(geometry.attributes.position, vertex3Index)

      // Localize a, b, and c to world coordinates from the vertices of a single face...
      object.localToWorld(a.copy(vertex1))
      object.localToWorld(b.copy(vertex2))
      object.localToWorld(c.copy(vertex3))

      // Create lines between each vertex...
      lineAB.set(a, b)
      lineBC.set(b, c)
      lineCA.set(c, a)

      // Determine if any line intersects the plane...
      return setPointOfIntersection(lineAB, mathPlane) ||
             setPointOfIntersection(lineBC, mathPlane) ||
             setPointOfIntersection(lineCA, mathPlane)
    }
  }
  
  function setPointOfIntersection(line: THREE.Line3, plane: THREE.Plane) {
    const point = new THREE.Vector3()
    plane.intersectLine(line, point)

    const isIntersection = point.x !== 0 || point.y !== 0 || point.z !== 0
    return isIntersection
  }
}