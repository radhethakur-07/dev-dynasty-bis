from typing import Any, Callable, Dict, Optional, Type
from pydantic import BaseModel, ValidationError
from app.core.logging import logger
from app.schemas.responses import ErrorResponse, FinalResponseUnion
from app.schemas.tools import (
    StandardSearchInput,
    CertificationGuidanceInput,
    SchemeInformationInput,
    HallmarkingSearchInput,
    LaboratorySearchInput,
    KnowledgeSearchInput
)
from app.tools.standards import search_bis_standards
from app.tools.certification import get_certification_guidance
from app.tools.schemes import get_scheme_information
from app.tools.hallmarking import search_hallmarking_info
from app.tools.laboratories import find_testing_labs
from app.tools.knowledge import search_bis_knowledge


class ToolDefinition:
    def __init__(self, name: str, description: str, schema: Type[BaseModel], handler: Callable):
        self.name = name
        self.description = description
        self.schema = schema
        self.handler = handler


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._register_default_tools()

    def register(self, name: str, description: str, schema: Type[BaseModel], handler: Callable):
        self._tools[name] = ToolDefinition(name, description, schema, handler)

    def _register_default_tools(self):
        self.register(
            name="search_bis_standards",
            description="Search Indian Standards (IS) applicable to a given product, machinery, or technical category.",
            schema=StandardSearchInput,
            handler=search_bis_standards
        )
        self.register(
            name="get_certification_guidance",
            description="Retrieve step-by-step BIS certification procedure, factory audit expectations, and documentation requirements.",
            schema=CertificationGuidanceInput,
            handler=get_certification_guidance
        )
        self.register(
            name="get_scheme_information",
            description="Retrieve overview, scope, and key features of BIS conformity schemes (e.g. ISI Mark, CRS, Hallmarking, FMCS).",
            schema=SchemeInformationInput,
            handler=get_scheme_information
        )
        self.register(
            name="search_hallmarking_info",
            description="Retrieve gold and silver hallmarking regulations, mandatory marks, purity grades (e.g. 22K916), and HUID verification.",
            schema=HallmarkingSearchInput,
            handler=search_hallmarking_info
        )
        self.register(
            name="find_testing_labs",
            description="Search BIS-recognized testing laboratories by product capability or location.",
            schema=LaboratorySearchInput,
            handler=find_testing_labs
        )
        self.register(
            name="search_bis_knowledge",
            description="Search general BIS knowledge, guidelines, consumer portals, and FAQs.",
            schema=KnowledgeSearchInput,
            handler=search_bis_knowledge
        )

    def is_tool_allowed(self, tool_name: str) -> bool:
        return tool_name in self._tools

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> FinalResponseUnion:
        if not self.is_tool_allowed(tool_name):
            logger.warning(f"Security Alert: Attempted invocation of non-allowlisted tool '{tool_name}' blocked.")
            return ErrorResponse(
                message=f"Tool '{tool_name}' is not permitted. Only controlled domain tools are allowed."
            )

        tool_def = self._tools[tool_name]

        # Pydantic validation guardrail
        try:
            validated_args = tool_def.schema(**arguments)
        except ValidationError as val_err:
            logger.error(f"Validation failure for tool '{tool_name}': {val_err}")
            return ErrorResponse(
                message=f"Validation failed for tool arguments: {val_err.errors()[0].get('msg', 'Invalid inputs')}"
            )
        except Exception as exc:
            logger.error(f"Unexpected error validating args for tool '{tool_name}': {exc}")
            return ErrorResponse(message="Invalid tool parameter format.")

        # Execute verified tool
        try:
            logger.info(f"Executing allowlisted tool: {tool_name}")
            return tool_def.handler(validated_args)
        except Exception as exc:
            logger.error(f"Error executing tool '{tool_name}': {exc}", exc_info=True)
            return ErrorResponse(message="An error occurred while retrieving BIS information.")

    def get_gemini_tool_declarations(self) -> list:
        declarations = []
        for name, tool_def in self._tools.items():
            declarations.append({
                "name": name,
                "description": tool_def.description,
                "parameters": tool_def.schema.model_json_schema()
            })
        return declarations


tool_registry = ToolRegistry()
