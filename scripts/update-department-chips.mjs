#!/usr/bin/env node

/**
 * Script para automatizar la adición de DepartmentChip a todos los archivos de vistas
 * Este script actualiza los headers y tablas de todos los componentes departamentales
 */

import fs from 'fs/promises';
import path from 'path';

const departmentFiles = [
    { file: 'credito.vue', key: 'credito' },
    { file: 'controlInterno.vue', key: 'control-interno' },
    { file: 'riesgos.vue', key: 'riesgos' },
    { file: 'compras.vue', key: 'compras' },
    { file: 'talentoHumano.vue', key: 'talento-humano' }
];

const viewsPath = 'c:/Users/SISTEMAS/Documents/Intranet/front-intranet/src/views/';

async function updateFile(filename, departmentKey) {
    const filePath = path.join(viewsPath, filename);
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // 1. Agregar import del componente
        if (!content.includes('import DepartmentChip')) {
            content = content.replace(
                /(import.*from.*['"]vue['"].*\n)/,
                `$1import DepartmentChip from '../components/DepartmentChip.vue'\n`
            );
        }
        
        // 2. Actualizar header
        content = content.replace(
            /(<div class="header-left">\s*\n\s*)(<h4 class="page-title">)/,
            `$1<div class="department-indicator">
                            <DepartmentChip 
                                department-key="${departmentKey}" 
                                variant="header"
                                size="md"
                            />
                        </div>
                        $2`
        );
        
        // 3. Actualizar tabla
        content = content.replace(
            /(<div class="table-header-section">\s*\n\s*)(<h5 class="table-title">Documentos<\/h5>)/,
            `$1<div class="table-title-container">
                                    $2
                                    <DepartmentChip 
                                        department-key="${departmentKey}" 
                                        variant="table"
                                        size="sm"
                                        dense
                                    />
                                </div>`
        );
        
        // 4. Actualizar estructura de la tabla header
        content = content.replace(
            /(<h5 class="table-title">Documentos<\/h5>\s*\n\s*)<q-space \/>/,
            `$1                            </div>
                                <q-space />`
        );
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Updated ${filename} with ${departmentKey} department chip`);
        
    } catch (error) {
        console.error(`❌ Error updating ${filename}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting department chip automation...\n');
    
    for (const dept of departmentFiles) {
        await updateFile(dept.file, dept.key);
    }
    
    console.log('\n✨ Department chip automation completed!');
}

main().catch(console.error);