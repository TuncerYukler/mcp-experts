"""Knowledge Graph implementation for MCP Code Expert System.

This module provides a simple graph database for storing code reviews,
code snippets, and relationships between them.
"""

import json
import os
from typing import Dict, List, Optional, Any, Set, Tuple, Union
import datetime
from uuid import uuid4
from pathlib import Path


class Entity:
    def __init__(
        self,
        id: str,
        name: str,
        entity_type: str,
        properties: Dict[str, Any] = None,
    ):
        self.id = id
        self.name = name
        self.type = entity_type
        self.properties = properties or {}
        self.relationships: Dict[str, List[str]] = {}  # relationship_type -> [entity_id]
    
    def add_relationship(self, relationship_type: str, target_entity_id: str) -> None:
        """Add a relationship to another entity"""
        if relationship_type not in self.relationships:
            self.relationships[relationship_type] = []
        if target_entity_id not in self.relationships[relationship_type]:
            self.relationships[relationship_type].append(target_entity_id)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert entity to dictionary representation"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "properties": self.properties,
            "relationships": self.relationships
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Entity':
        """Create entity from dictionary representation"""
        entity = cls(
            id=data["id"],
            name=data["name"],
            entity_type=data["type"],
            properties=data["properties"]
        )
        entity.relationships = data.get("relationships", {})
        return entity


class KnowledgeGraphManager:
    def __init__(self, storage_path: str = None):
        self.entities: Dict[str, Entity] = {}
        self.storage_path = storage_path
        if storage_path and os.path.exists(storage_path):
            self.load()
    
    def add_entity(
        self,
        name: str,
        entity_type: str,
        properties: Dict[str, Any] = None
    ) -> Entity:
        """Add an entity to the knowledge graph"""
        entity_id = f"{uuid4()}"
        entity = Entity(id=entity_id, name=name, entity_type=entity_type, properties=properties)
        self.entities[entity_id] = entity
        if self.storage_path:
            self.save()
        return entity
    
    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get an entity from the knowledge graph by ID"""
        return self.entities.get(entity_id)
    
    def get_entities_by_type(self, entity_type: str) -> List[Entity]:
        """Get all entities of a specific type"""
        return [entity for entity in self.entities.values() if entity.type == entity_type]
    
    def add_relationship(
        self, 
        source_entity_id: str, 
        relationship_type: str, 
        target_entity_id: str,
        bidirectional: bool = False,
        inverse_relationship_type: str = None
    ) -> None:
        """Add a relationship between two entities"""
        source_entity = self.get_entity(source_entity_id)
        target_entity = self.get_entity(target_entity_id)
        
        if not source_entity or not target_entity:
            raise ValueError("Both source and target entities must exist")
        
        source_entity.add_relationship(relationship_type, target_entity_id)
        
        if bidirectional:
            inverse_type = inverse_relationship_type or f"inverse_{relationship_type}"
            target_entity.add_relationship(inverse_type, source_entity_id)
        
        if self.storage_path:
            self.save()
    
    def search_entities(self, query: str) -> List[Entity]:
        """Search for entities in the knowledge graph"""
        results = []
        query = query.lower()
        
        for entity in self.entities.values():
            # Search in name and type
            if query in entity.name.lower() or query in entity.type.lower():
                results.append(entity)
                continue
            
            # Search in properties
            found = False
            for key, value in entity.properties.items():
                if isinstance(value, str) and query in value.lower():
                    results.append(entity)
                    found = True
                    break
                elif isinstance(value, (int, float)) and query in str(value).lower():
                    results.append(entity)
                    found = True
                    break
            
            if found:
                continue
            
            # Search in relationships
            for rel_type, target_ids in entity.relationships.items():
                if query in rel_type.lower():
                    results.append(entity)
                    break
        
        return results
    
    def save(self) -> None:
        """Save the knowledge graph to storage"""
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        data = {
            "entities": {entity_id: entity.to_dict() for entity_id, entity in self.entities.items()},
            "version": 1,
            "updated_at": datetime.datetime.now().isoformat()
        }
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load(self) -> None:
        """Load the knowledge graph from storage"""
        if not os.path.exists(self.storage_path):
            return
        
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        self.entities = {}
        for entity_id, entity_data in data.get("entities", {}).items():
            self.entities[entity_id] = Entity.from_dict(entity_data)
    
    def clear(self) -> None:
        """Clear all entities from the knowledge graph"""
        self.entities = {}
        if self.storage_path and os.path.exists(self.storage_path):
            os.remove(self.storage_path)
    
    def get_related_entities(self, entity_id: str, relationship_type: Optional[str] = None) -> List[Entity]:
        """Get entities related to the given entity"""
        entity = self.get_entity(entity_id)
        if not entity:
            return []
        
        related_entity_ids: Set[str] = set()
        
        if relationship_type:
            # Get entities with specific relationship type
            related_entity_ids.update(entity.relationships.get(relationship_type, []))
        else:
            # Get all related entities
            for rel_ids in entity.relationships.values():
                related_entity_ids.update(rel_ids)
        
        return [self.get_entity(related_id) for related_id in related_entity_ids if related_id in self.entities]


class KnowledgeGraph:
    """Simple in-memory graph database with JSON persistence."""

    def __init__(self, file_path: str = "data/knowledge_graph.json"):
        """Initialize the knowledge graph.
        
        Args:
            file_path: Path to the JSON file for persistence
        """
        self.file_path = file_path
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []
        self.load()

    def load(self) -> None:
        """Load the knowledge graph from the JSON file."""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        
        # Load the graph if the file exists
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r') as f:
                    data = json.load(f)
                    self.nodes = data.get('nodes', {})
                    self.edges = data.get('edges', [])
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading knowledge graph: {e}")
                # Initialize with empty graph on error
                self.nodes = {}
                self.edges = []

    def save(self) -> None:
        """Save the knowledge graph to the JSON file."""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            
            # Save to file
            with open(self.file_path, 'w') as f:
                json.dump({
                    'nodes': self.nodes,
                    'edges': self.edges
                }, f, indent=2)
        except IOError as e:
            print(f"Error saving knowledge graph: {e}")

    def add_node(self, name: str, node_type: str, properties: Dict[str, Any]) -> str:
        """Add a node to the graph.
        
        Args:
            name: Node name (unique identifier)
            node_type: Type of node (e.g., 'code', 'review')
            properties: Node properties
            
        Returns:
            Node name (identifier)
        """
        # Create node with metadata
        self.nodes[name] = {
            'type': node_type,
            'created_at': datetime.now().isoformat(),
            'properties': properties
        }
        self.save()
        return name

    def add_edge(self, source: str, target: str, edge_type: str, properties: Dict[str, Any] = None) -> None:
        """Add an edge between two nodes.
        
        Args:
            source: Source node name
            target: Target node name
            edge_type: Type of edge (e.g., 'reviewed_by')
            properties: Edge properties
        """
        if properties is None:
            properties = {}
            
        # Check if nodes exist
        if source not in self.nodes or target not in self.nodes:
            raise ValueError(f"Cannot create edge between non-existent nodes: {source} -> {target}")
            
        # Create edge with metadata
        self.edges.append({
            'source': source,
            'target': target,
            'type': edge_type,
            'created_at': datetime.now().isoformat(),
            'properties': properties
        })
        self.save()

    def get_node(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a node by name.
        
        Args:
            name: Node name
            
        Returns:
            Node data or None if not found
        """
        return self.nodes.get(name)

    def get_nodes_by_type(self, node_type: str) -> List[Dict[str, Any]]:
        """Get all nodes of a specific type.
        
        Args:
            node_type: Type of nodes to get
            
        Returns:
            List of nodes
        """
        return [
            {'name': name, **data}
            for name, data in self.nodes.items()
            if data.get('type') == node_type
        ]

    def search_nodes(self, query: str) -> List[Dict[str, Any]]:
        """Search for nodes by text in their properties.
        
        Args:
            query: Text to search for
            
        Returns:
            List of matching nodes
        """
        results = []
        query = query.lower()
        
        for name, data in self.nodes.items():
            # Search in name
            if query in name.lower():
                results.append({'name': name, **data})
                continue
                
            # Search in properties
            props = data.get('properties', {})
            for prop_value in props.values():
                if isinstance(prop_value, str) and query in prop_value.lower():
                    results.append({'name': name, **data})
                    break
                    
        return results

    def get_related_nodes(self, node_name: str, edge_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get nodes related to a specific node.
        
        Args:
            node_name: Name of the node
            edge_type: Optional filter for edge type
            
        Returns:
            List of related nodes
        """
        related = []
        
        # Find edges where the node is source or target
        for edge in self.edges:
            if edge['source'] == node_name:
                if edge_type is None or edge['type'] == edge_type:
                    target = edge['target']
                    if target in self.nodes:
                        related.append({
                            'name': target, 
                            **self.nodes[target],
                            'relation': {
                                'type': edge['type'],
                                'direction': 'outgoing',
                                'properties': edge.get('properties', {})
                            }
                        })
                        
            elif edge['target'] == node_name:
                if edge_type is None or edge['type'] == edge_type:
                    source = edge['source']
                    if source in self.nodes:
                        related.append({
                            'name': source, 
                            **self.nodes[source],
                            'relation': {
                                'type': edge['type'],
                                'direction': 'incoming',
                                'properties': edge.get('properties', {})
                            }
                        })
                        
        return related

    def get_all(self) -> Dict[str, Union[Dict[str, Any], List[Dict[str, Any]]]]:
        """Get the entire graph.
        
        Returns:
            Dictionary containing all nodes and edges
        """
        # Format nodes to include their names
        formatted_nodes = [
            {'name': name, **data}
            for name, data in self.nodes.items()
        ]
        
        return {
            'nodes': formatted_nodes,
            'edges': self.edges
        }

    def clear(self) -> None:
        """Clear the graph."""
        self.nodes = {}
        self.edges = []
        self.save() 