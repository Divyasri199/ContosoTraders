﻿namespace TailwindTraders.Api.Core.Requests.Handlers;

internal class GetProductsRequestHandler : IRequestHandler<GetProductsRequest, IActionResult>
{
    private readonly IProductService _productService;

    public GetProductsRequestHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<IActionResult> Handle(GetProductsRequest request, CancellationToken cancellationToken)
    {
        var brands = await _productService.GetBrandsAsync(cancellationToken);

        var types = await _productService.GetTypesAsync(cancellationToken);

        var typeIds = types
            .Where(t => request.Types.Contains(t.Code))
            .Select(t => t.Id)
            .ToArray();

        var products = await _productService.GetProductsAsync(request.Brands, typeIds, cancellationToken);

        if (!products.Any()) return new NoContentResult();

        var aggrResponse = new
        {
            Products = products,
            Brands = brands,
            Types = types
        };

        return new OkObjectResult(aggrResponse);
    }
}