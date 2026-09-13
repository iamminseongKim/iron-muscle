import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import assert from 'node:assert/strict';
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
for (const name of ['anatomy', 'skeleton']) {
 const source = await io.read(`public/anatomy/${name}.glb`);
 source.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const encoded = await io.writeBinary(source);
 const decoded = await io.readBinary(encoded);
 const originalMeshes=source.getRoot().listMeshes(), resultMeshes=decoded.getRoot().listMeshes();
 assert.equal(resultMeshes.length, originalMeshes.length);
 originalMeshes.forEach((mesh,i)=>{
   assert.equal(resultMeshes[i].getName(),mesh.getName());
   mesh.listPrimitives().forEach((primitive,j)=>{
     const result=resultMeshes[i].listPrimitives()[j];
     for(const semantic of primitive.listSemantics()) assert.deepEqual(result.getAttribute(semantic).getArray(),primitive.getAttribute(semantic).getArray());
     // Meshopt may cyclically rotate triangle indices without changing triangles.
     const a=primitive.getIndices()?.getArray(),b=result.getIndices()?.getArray();
     if(a){assert.equal(a.length,b.length);for(let k=0;k<a.length;k+=3)assert.ok([0,1,2].some(offset=>[0,1,2].every(n=>a[k+n]===b[k+(n+offset)%3])));}
   });
 });
 fs.writeFileSync(`dist/anatomy/${name}.glb.gz`,gzipSync(encoded,{level:9}));
 console.log(`Verified ${name}: ${originalMeshes.length} meshes, exact attributes and triangle topology; ${fs.statSync(`dist/anatomy/${name}.glb.gz`).size} bytes`);
}
